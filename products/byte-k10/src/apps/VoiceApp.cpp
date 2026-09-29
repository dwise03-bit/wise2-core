#include "VoiceApp.h"

#include <Arduino.h>
#include <SD.h>
#include <math.h>
#include <stdio.h>
#include <string.h>

#include "../core/Kernel.h"
#include "unihiker_k10.h"

namespace byte_os {

namespace {
// readMICData() returns an accumulated magnitude, not a normalised value, so
// the scale is empirical. Calibrated against measured quiet-room and
// speaking-at-30cm readings rather than assumed.
constexpr float    kFullScale     = 900000.0f;
constexpr float    kSpeechMargin  = 0.055f;  // rise above noise floor = speech
constexpr uint32_t kSampleMs      = 50;      // 20Hz; I2S reads are not free
constexpr uint32_t kSpeakerCueMs  = 1400;
constexpr uint8_t  kRecordSeconds = 3;
constexpr const char* kTakePath   = "/voice_take.wav";
}  // namespace

VoiceApp::VoiceApp(UNIHIKER_K10& board, Music& music)
    : board_(board), music_(music) {}

const char* VoiceApp::actionLabel(Action action) const {
    switch (action) {
        case Action::SpeakerCue: return "SPEAKER";
        case Action::RecordTake: return "RECORD";
        case Action::PlayTake:   return "PLAY TAKE";
    }
    return "?";
}

bool VoiceApp::mountCard() {
    if (SD.cardType() != CARD_NONE) {
        sdMounted_ = true;
    } else if (SD.begin()) {
        sdMounted_ = (SD.cardType() != CARD_NONE);
    } else {
        sdMounted_ = false;
    }
    if (!sdMounted_) takeAvailable_ = false;
    return sdMounted_;
}

void VoiceApp::refreshTakeState() {
    if (!mountCard()) {
        takeAvailable_ = false;
        takeMs_ = 0;
        return;
    }
    takeAvailable_ = SD.exists(kTakePath);
    if (!takeAvailable_) {
        takeMs_ = 0;
        return;
    }
    File f = SD.open(kTakePath, FILE_READ);
    if (!f) {
        takeAvailable_ = false;
        takeMs_ = 0;
        return;
    }
    const uint32_t bytes = static_cast<uint32_t>(f.size());
    f.close();
    takeMs_ = (bytes > 44) ? ((bytes - 44) * 1000UL) / 64000UL : 0;
}

Status VoiceApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    health_ = Status::pass("2x MEMS mic + 2W speaker (I2S)");
    return health_;
}

void VoiceApp::onEnter() {
    level_ = peak_ = 0.0f;
    noiseFloor_ = 0.0f;
    speaking_ = false;
    speechMs_ = 0;
    mode_ = AudioMode::Live;
    sel_ = Action::SpeakerCue;
    busyUntilMs_ = 0;
    lastSampleMs_ = 0;
    strncpy(status_, "live meter", sizeof(status_) - 1);
    status_[sizeof(status_) - 1] = '\0';
    refreshTakeState();
    if (kernel_) kernel_->face().setState(ByteState::Listening);
}

void VoiceApp::onExit() {
    stopAudio();
    if (kernel_) kernel_->face().setSpeechLevel(0.0f);
}

void VoiceApp::stopAudio() {
    if (mode_ == AudioMode::Cue) {
        music_.stopPlayTone();
    } else if (mode_ == AudioMode::Playback) {
        music_.stopPlayAudio();
    }
    if (!recording_) mode_ = AudioMode::Live;
}

void VoiceApp::beginCue() {
    stopAudio();
    mode_ = AudioMode::Cue;
    busyUntilMs_ = millis() + kSpeakerCueMs;
    strncpy(status_, "speaker cue", sizeof(status_) - 1);
    if (kernel_) kernel_->face().setState(ByteState::Happy);
    music_.playMusic(BA_DING, OnceInBackground);
}

void VoiceApp::recordTask(void* arg) {
    auto* self = static_cast<VoiceApp*>(arg);
    self->music_.recordSaveToTFCard(kTakePath, kRecordSeconds);
    self->recording_ = false;
    vTaskDelete(nullptr);
}

void VoiceApp::beginRecord() {
    if (!mountCard()) {
        strncpy(status_, "insert microSD", sizeof(status_) - 1);
        return;
    }
    stopAudio();
    recording_ = true;
    mode_ = AudioMode::Recording;
    busyUntilMs_ = millis() + static_cast<uint32_t>(kRecordSeconds) * 1000UL + 400UL;
    strncpy(status_, "recording 3s", sizeof(status_) - 1);
    if (kernel_) kernel_->face().setState(ByteState::Listening);
    xTaskCreatePinnedToCore(recordTask, "voice_record", 6 * 1024, this, 3, nullptr, 1);
}

void VoiceApp::beginPlayback() {
    refreshTakeState();
    if (!takeAvailable_) {
        strncpy(status_, "no take yet", sizeof(status_) - 1);
        return;
    }
    stopAudio();
    mode_ = AudioMode::Playback;
    busyUntilMs_ = millis() + takeMs_ + 500UL;
    strncpy(status_, "playing take", sizeof(status_) - 1);
    if (kernel_) kernel_->face().setState(ByteState::Happy);
    music_.playTFCardAudio(kTakePath);
}

void VoiceApp::update(uint32_t dtMs) {
    const uint32_t now = millis();

    // Playback owns the I2S bus (xI2SMutex); do not meter while it runs.
    if (mode_ != AudioMode::Live) {
        if (mode_ == AudioMode::Recording) {
            if (!recording_) {
                mode_ = AudioMode::Live;
                refreshTakeState();
                strncpy(status_, takeAvailable_ ? "take saved" : "record failed", sizeof(status_) - 1);
                if (kernel_) kernel_->face().setState(ByteState::Listening);
            }
        } else if (now >= busyUntilMs_) {
            stopAudio();
            strncpy(status_, "live meter", sizeof(status_) - 1);
            if (kernel_) kernel_->face().setState(ByteState::Listening);
        }
        return;
    }

    if (now - lastSampleMs_ < kSampleMs) return;
    lastSampleMs_ = now;

    rawLevel_ = board_.readMICData();
    const float norm = fminf(static_cast<float>(rawLevel_) / kFullScale, 1.0f);

    // Smooth for display; attack faster than release so speech looks lively
    // but the meter does not flicker.
    const float dt = dtMs / 1000.0f;
    const float rate = (norm > level_) ? 18.0f : 6.0f;
    level_ += (norm - level_) * (1.0f - expf(-rate * dt));

    peak_ = fmaxf(peak_ * 0.94f, level_);

    // Adaptive noise floor: track ambient slowly, and only downward-biased so
    // sustained speech does not raise the floor and gate itself out.
    const float floorRate = (norm < noiseFloor_) ? 1.2f : 0.08f;
    noiseFloor_ += (norm - noiseFloor_) * (1.0f - expf(-floorRate * dt));

    const bool wasSpeaking = speaking_;
    speaking_ = (level_ > noiseFloor_ + kSpeechMargin);
    speechMs_ = speaking_ ? speechMs_ + (now - (now - kSampleMs)) : 0;

    history_[histIdx_] = static_cast<uint32_t>(level_ * 100.0f);
    histIdx_ = static_cast<uint8_t>((histIdx_ + 1) % (sizeof(history_) / sizeof(history_[0])));

    // Drive BYTE's mouth from the real microphone level.
    if (kernel_) {
        kernel_->face().setSpeechLevel(speaking_ ? level_ : 0.0f);
        if (speaking_ != wasSpeaking) {
            kernel_->face().setState(speaking_ ? ByteState::Talking
                                               : ByteState::Listening);
        }
    }
}

void VoiceApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 10;

    if (kernel_) kernel_->face().draw(d, W / 2, 92);

    // ---- Level meter -----------------------------------------------------
    const int16_t barY = 168, barH = 18;
    const int16_t barW = W - pad * 2;
    d.fillRoundRect(pad, barY, barW, barH, 5, theme::Surface);

    const int16_t fill = static_cast<int16_t>(barW * level_);
    if (fill > 2) {
        Color c = theme::Success;
        if (level_ > 0.75f)      c = theme::Danger;
        else if (level_ > 0.45f) c = theme::Warning;
        d.fillRoundRect(pad, barY, fill, barH, 5, c);
    }
    // Peak marker and the VAD threshold, so the gate is visible.
    const int16_t px = pad + static_cast<int16_t>(barW * peak_);
    d.fillRect(px, barY, 2, barH, theme::ChromeBright);
    const int16_t tx = pad + static_cast<int16_t>(barW * (noiseFloor_ + kSpeechMargin));
    d.fillRect(tx, barY - 3, 1, barH + 6, theme::Accent);

    // ---- Waveform history ------------------------------------------------
    constexpr int16_t wfY = 196, wfH = 40;
    const uint8_t n = sizeof(history_) / sizeof(history_[0]);
    const int16_t step = barW / n;
    for (uint8_t i = 0; i < n; ++i) {
        const uint8_t idx = static_cast<uint8_t>((histIdx_ + i) % n);
        const int16_t h = static_cast<int16_t>((history_[idx] * wfH) / 100);
        if (h > 0) {
            d.fillRect(pad + i * step, wfY + wfH - h, step > 1 ? step - 1 : 1, h,
                       theme::AccentDim);
        }
    }

    // ---- Status ----------------------------------------------------------
    char buf[40];
    d.setTextSize(2);
    d.setTextColor(speaking_ ? theme::Accent : theme::TextMuted);
    const char* st = speaking_ ? "SPEAKING" : "LISTENING";
    d.drawText(st, (W - d.textWidth(st)) / 2, 246);

    if (mode_ == AudioMode::Cue) snprintf(buf, sizeof(buf), "speaker cue running");
    else if (mode_ == AudioMode::Recording) snprintf(buf, sizeof(buf), "recording to SD");
    else if (mode_ == AudioMode::Playback) snprintf(buf, sizeof(buf), "playing /voice_take.wav");
    else snprintf(buf, sizeof(buf), "lvl %.2f  floor %.2f", level_, noiseFloor_);
    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText(buf, (W - d.textWidth(buf)) / 2, 274);

    constexpr int16_t actionY = 286;
    constexpr int16_t actionH = 24;
    const int16_t actionW = (W - pad * 4) / 3;
    for (uint8_t i = 0; i < 3; ++i) {
        const int16_t x = pad + i * (actionW + pad);
        const bool active = (static_cast<uint8_t>(sel_) == i);
        d.fillRoundRect(x, actionY, actionW, actionH, 5,
                        active ? theme::AccentDim : theme::Surface);
        d.setTextSize(1);
        d.setTextColor(active ? theme::Accent : theme::TextPrimary);
        const char* label = actionLabel(static_cast<Action>(i));
        d.drawText(label,
                   x + (actionW - d.textWidth(label)) / 2,
                   actionY + 8);
    }

    d.setTextColor(theme::TextMuted);
    d.drawText(status_, pad, d.height() - 26);
    d.drawText("tilt: pick   A: run   B: back/stop", pad, d.height() - 14);
}

bool VoiceApp::onInput(const InputReport& r) {
    if (r.event == InputEvent::BackPress && mode_ != AudioMode::Live) {
        if (mode_ == AudioMode::Recording) {
            strncpy(status_, "recording...", sizeof(status_) - 1);
        } else {
            stopAudio();
            strncpy(status_, "stopped", sizeof(status_) - 1);
            if (kernel_) kernel_->face().setState(ByteState::Listening);
        }
        return true;
    }

    if (mode_ != AudioMode::Live) return false;

    switch (r.event) {
        case InputEvent::NavDown:
        case InputEvent::NavRight:
            sel_ = static_cast<Action>((static_cast<uint8_t>(sel_) + 1) % 3);
            return true;
        case InputEvent::NavUp:
        case InputEvent::NavLeft:
            sel_ = static_cast<Action>((static_cast<uint8_t>(sel_) + 2) % 3);
            return true;
        case InputEvent::SelectPress:
            switch (sel_) {
                case Action::SpeakerCue: beginCue(); break;
                case Action::RecordTake: beginRecord(); break;
                case Action::PlayTake:   beginPlayback(); break;
            }
            return true;
        default:
            return false;
    }
}

}  // namespace byte_os
