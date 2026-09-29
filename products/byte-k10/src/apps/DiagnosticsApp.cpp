#include "DiagnosticsApp.h"

#include <Arduino.h>
#include <SD.h>
#include <WiFi.h>
#include <string.h>
#include <stdio.h>

#include "../core/Kernel.h"
#include "../display/DisplayManager_K10.h"
#include "../input/InputManager_K10.h"
#include "unihiker_k10.h"

namespace byte_os {

namespace {
const char* kNames[] = {
    "Display",  "Back buffer", "Input",   "Accelerometer", "Light sensor",
    "Temp/humidity", "RGB LEDs", "PSRAM",  "Microphone", "Speaker",
    "Storage (SD)",  "WiFi radio",
};
}

DiagnosticsApp::DiagnosticsApp(UNIHIKER_K10& board, Music& music)
    : board_(board), music_(music) {
    resetTests();
}

Status DiagnosticsApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    return Status::pass();
}

void DiagnosticsApp::resetTests() {
    for (uint8_t i = 0; i < kTestCount; ++i) {
        tests_[i].name = kNames[i];
        tests_[i].result = Health::Unavailable;
        snprintf(tests_[i].detail, sizeof(tests_[i].detail), "not run");
    }
}

void DiagnosticsApp::onEnter() {
    scroll_ = 0;
    resetTests();
    music_.stopPlayTone();
    running_ = 0;                    // start immediately on entry
    stepMs_ = millis();
    if (kernel_) kernel_->face().setState(ByteState::Thinking);
}

// One test per tick so the UI keeps animating while the suite runs.
void DiagnosticsApp::runStep() {
    Test& t = tests_[running_];

    switch (running_) {
        case 0: {   // Display
            const int16_t w = kernel_ ? kernel_->display().width() : 0;
            const int16_t h = kernel_ ? kernel_->display().height() : 0;
            const bool ok = (w == 240 && h == 320);
            t.result = ok ? Health::Pass : Health::Error;
            snprintf(t.detail, sizeof(t.detail), "%dx%d", w, h);
            break;
        }
        case 1: {   // Back buffer location + frame rate
            auto* dm = static_cast<DisplayManager_K10*>(
                kernel_ ? &kernel_->display() : nullptr);
            if (!dm) { t.result = Health::Error; snprintf(t.detail, sizeof(t.detail), "none"); break; }
            const float f = dm->fps();
            // fps is averaged over a 1s window, so it is legitimately 0.0 for
            // the first second after boot. Treating that as a fault made a
            // healthy system report WARN on entry.
            if (f <= 0.01f) {
                t.result = Health::Pass;
                snprintf(t.detail, sizeof(t.detail), "%s measuring",
                         dm->bufferedInPsram() ? "PSRAM" : "SRAM");
            } else {
                t.result = (f > 20.0f) ? Health::Pass : Health::Warning;
                snprintf(t.detail, sizeof(t.detail), "%s %.0ffps",
                         dm->bufferedInPsram() ? "PSRAM" : "SRAM", f);
            }
            break;
        }
        case 2: {   // Input
            t.result = Health::Pass;
            snprintf(t.detail, sizeof(t.detail), "btn+tilt, no touch");
            break;
        }
        case 3: {   // Accelerometer — must show a plausible 1g magnitude
            int x = 0, y = 0, z = 0;
            if (kernel_) kernel_->input().acceleration(x, y, z);
            const int mag = abs(x) + abs(y) + abs(z);
            t.result = (mag > 300 && mag < 3000) ? Health::Pass : Health::Warning;
            snprintf(t.detail, sizeof(t.detail), "%d,%d,%d", x, y, z);
            break;
        }
        case 4: {   // LTR303 light sensor over I2C
            uint8_t buf[4];
            const bool ok = (board_.readData(0x29, 0x88, buf, 4) == 4);
            t.result = ok ? Health::Pass : Health::Error;
            snprintf(t.detail, sizeof(t.detail), ok ? "0x29 ok" : "no reply");
            break;
        }
        case 5: {   // AHT20 presence on the I2C bus
            Wire.beginTransmission(0x38);
            const bool ok = (Wire.endTransmission() == 0);
            t.result = ok ? Health::Pass : Health::Warning;
            snprintf(t.detail, sizeof(t.detail), ok ? "0x38 ok" : "no reply");
            break;
        }
        case 6: {   // RGB LEDs — visible confirmation, then restore
            board_.rgb->setRangeColor(0, 2, 0x00FF00);
            t.result = Health::Pass;
            snprintf(t.detail, sizeof(t.detail), "3x WS2812 lit");
            break;
        }
        case 7: {   // PSRAM
            const size_t sz = ESP.getPsramSize();
            t.result = (sz > 0) ? Health::Pass : Health::Error;
            snprintf(t.detail, sizeof(t.detail), "%luKB free",
                     (unsigned long)(ESP.getFreePsram() / 1024));
            break;
        }
        case 8: {   // Microphone energy sample
            const uint64_t level = board_.readMICData();
            const bool ok = (level > 0 && level < 2000000ULL);
            t.result = ok ? Health::Pass : Health::Warning;
            snprintf(t.detail, sizeof(t.detail), "%llu", level);
            break;
        }
        case 9: {   // Speaker cue via the SDK's managed I2S path
            music_.playMusic(BA_DING, OnceInBackground);
            t.result = Health::Pass;
            snprintf(t.detail, sizeof(t.detail), "cue started");
            break;
        }
        case 10: {   // microSD — absent card is UNAVAILABLE, not a failure
            const uint8_t type = SD.cardType();
            if (type == CARD_NONE) {
                t.result = Health::Unavailable;
                snprintf(t.detail, sizeof(t.detail), "no card");
            } else {
                t.result = Health::Pass;
                snprintf(t.detail, sizeof(t.detail), "%lluMB",
                         SD.cardSize() / (1024ULL * 1024ULL));
            }
            break;
        }
        case 11: {   // WiFi radio comes up (does not connect)
            const wifi_mode_t m = WiFi.getMode();
            WiFi.mode(WIFI_STA);
            const bool ok = (WiFi.getMode() == WIFI_STA);
            t.result = ok ? Health::Pass : Health::Error;
            snprintf(t.detail, sizeof(t.detail), ok ? "STA ready" : "radio fail");
            WiFi.mode(m);
            break;
        }
        default: break;
    }

    Serial.printf("[DIAG] %-14s %s (%s)\n", t.name,
                  t.result == Health::Pass ? "PASS" :
                  t.result == Health::Warning ? "WARN" :
                  t.result == Health::Error ? "ERROR" : "N/A", t.detail);
    Serial.flush();
}

void DiagnosticsApp::update(uint32_t dtMs) {
    (void)dtMs;
    if (running_ < 0) return;

    // 220ms between tests: slow enough to watch, fast enough to feel snappy.
    if (millis() - stepMs_ < 220) return;
    stepMs_ = millis();

    runStep();
    if (++running_ >= kTestCount) {
        running_ = -1;
        board_.rgb->setRangeColor(0, 2, 0x001428);   // restore ambient
        if (kernel_) kernel_->face().setState(ByteState::Happy);
    }
}

void DiagnosticsApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 8, rowH = 22;
    const int16_t top = DisplayManager::kStatusBarHeight + 6;
    const uint8_t visible = 11;

    for (uint8_t i = 0; i < visible; ++i) {
        const uint8_t idx = static_cast<uint8_t>(i + scroll_);
        if (idx >= kTestCount) break;
        const Test& t = tests_[idx];
        const int16_t y = top + i * rowH;

        const bool active = (running_ == static_cast<int8_t>(idx));
        if (active) d.fillRoundRect(pad, y, W - pad * 2, rowH, 4, theme::SurfaceAlt);

        Color c = theme::TextMuted;
        const char* tag = "N/A";
        switch (t.result) {
            case Health::Pass:    c = theme::Success; tag = "PASS";  break;
            case Health::Warning: c = theme::Warning; tag = "WARN";  break;
            case Health::Error:   c = theme::Danger;  tag = "ERROR"; break;
            case Health::Unavailable: c = theme::TextMuted; tag = "N/A"; break;
        }

        d.fillCircle(pad + 8, y + rowH / 2, 3, c);
        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        d.drawText(t.name, pad + 18, y + 7);

        d.setTextColor(c);
        d.drawText(tag, W - pad - 6 - d.textWidth(tag), y + 7);

        d.setTextColor(theme::TextMuted);
        d.drawText(t.detail, W - pad - 46 - d.textWidth(t.detail), y + 7);
    }

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText(running_ >= 0 ? "running..." : "A: run again   B: back",
               pad, d.height() - 14);
}

bool DiagnosticsApp::onInput(const InputReport& r) {
    if (r.event == InputEvent::SelectPress && running_ < 0) {
        resetTests();
        running_ = 0;
        stepMs_ = millis();
        return true;
    }
    if (r.event == InputEvent::NavDown && scroll_ < static_cast<int8_t>(kTestCount) - 11) {
        ++scroll_; return true;
    }
    if (r.event == InputEvent::NavUp && scroll_ > 0) { --scroll_; return true; }
    return false;
}

}  // namespace byte_os
