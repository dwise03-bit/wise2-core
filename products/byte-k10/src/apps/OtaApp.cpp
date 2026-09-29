#include "OtaApp.h"

#include <Arduino.h>
#include <WiFi.h>
#include <ArduinoOTA.h>
#include <stdio.h>
#include <string.h>

#include "esp_ota_ops.h"
#include "esp_partition.h"

#include "../core/Kernel.h"

namespace byte_os {

namespace {
OtaApp* gSelf = nullptr;          // ArduinoOTA callbacks are free functions
constexpr const char* kHostname = "byte-k10";
}

Status OtaApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    gSelf = this;
    probePartitions();

    if (!otaCapable_) {
        health_ = Status::unavailable("no OTA partition in table");
        state_ = State::NoPartition;
    } else {
        health_ = Status::pass("dual-slot OTA available");
        state_ = State::NoWifi;
    }
    return health_;
}

void OtaApp::probePartitions() {
    const esp_partition_t* running = esp_ota_get_running_partition();
    if (running) {
        runningSize_ = running->size;
        strncpy(runningName_, running->label, sizeof(runningName_) - 1);
        runningName_[sizeof(runningName_) - 1] = '\0';
    } else {
        snprintf(runningName_, sizeof(runningName_), "unknown");
    }
    sketchSize_ = ESP.getSketchSize();

    // The decisive test. On this board's stock table this returns NULL: the
    // single app partition is type `factory`, and there is no otadata.
    const esp_partition_t* next = esp_ota_get_next_update_partition(nullptr);
    otaCapable_ = (next != nullptr);

    Serial.printf("[OTA] running='%s' size=%luKB sketch=%luKB next=%s\n",
                  runningName_, (unsigned long)(runningSize_ / 1024),
                  (unsigned long)(sketchSize_ / 1024),
                  next ? next->label : "NONE (no OTA slot)");
    Serial.flush();
}

void OtaApp::arm() {
    if (armed_ || !otaCapable_) return;

    ArduinoOTA.setHostname(kHostname);
    ArduinoOTA.onStart([]() {
        if (!gSelf) return;
        gSelf->state_ = State::Receiving;
        gSelf->progress_ = 0;
        Serial.println("[OTA] transfer started");
    });
    ArduinoOTA.onProgress([](unsigned int done, unsigned int total) {
        if (!gSelf || total == 0) return;
        gSelf->progress_ = static_cast<uint8_t>((done * 100) / total);
    });
    ArduinoOTA.onEnd([]() {
        if (!gSelf) return;
        gSelf->state_ = State::Done;
        gSelf->progress_ = 100;
        Serial.println("[OTA] complete, rebooting");
    });
    ArduinoOTA.onError([](ota_error_t err) {
        if (!gSelf) return;
        gSelf->state_ = State::Failed;
        snprintf(gSelf->detail_, sizeof(gSelf->detail_), "error %d", (int)err);
        Serial.printf("[OTA] failed: %d\n", (int)err);
    });

    ArduinoOTA.begin();
    armed_ = true;
    Serial.printf("[OTA] listening as '%s' at %s\n",
                  kHostname, WiFi.localIP().toString().c_str());
    Serial.flush();
}

void OtaApp::onEnter() {
    if (kernel_) kernel_->face().setState(ByteState::UpdateAvailable);
    if (!otaCapable_) { state_ = State::NoPartition; return; }
    state_ = (WiFi.status() == WL_CONNECTED) ? State::Ready : State::NoWifi;
    if (state_ == State::Ready) arm();
}

void OtaApp::onExit() {
    // ArduinoOTA has no clean shutdown; simply stop servicing it. Leaving the
    // listener armed while the user is elsewhere would allow a background
    // flash with no visible progress, which is worse.
    if (kernel_) kernel_->face().setState(ByteState::Idle);
}

void OtaApp::update(uint32_t dtMs) {
    (void)dtMs;
    if (!otaCapable_) return;

    if (state_ == State::NoWifi && WiFi.status() == WL_CONNECTED) {
        state_ = State::Ready;
        arm();
    }
    if (armed_ && (state_ == State::Ready || state_ == State::Receiving)) {
        ArduinoOTA.handle();
    }
}

void OtaApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 10;
    const int16_t top = DisplayManager::kStatusBarHeight + 10;

    char buf[72];

    switch (state_) {

    case State::NoPartition: {
        d.setTextSize(2);
        d.setTextColor(theme::Warning);
        d.drawText("UNAVAILABLE", pad, top);

        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        d.drawText("This board has no OTA slot.", pad, top + 30);

        d.setTextColor(theme::TextMuted);
        d.drawText("DFRobot's only partition scheme", pad, top + 50);
        d.drawText("declares one 'factory' app and no", pad, top + 62);
        d.drawText("otadata, so the ESP-IDF OTA API", pad, top + 74);
        d.drawText("has nowhere to write an update.", pad, top + 86);

        // Show the evidence rather than just asserting it.
        d.fillRoundRect(pad, top + 106, W - pad * 2, 66, 6, theme::Surface);
        snprintf(buf, sizeof(buf), "running:  %s", runningName_);
        d.setTextColor(theme::TextPrimary);
        d.drawText(buf, pad + 8, top + 114);
        snprintf(buf, sizeof(buf), "slot size: %lu KB", (unsigned long)(runningSize_ / 1024));
        d.drawText(buf, pad + 8, top + 128);
        snprintf(buf, sizeof(buf), "firmware:  %lu KB", (unsigned long)(sketchSize_ / 1024));
        d.drawText(buf, pad + 8, top + 142);
        d.setTextColor(theme::Danger);
        d.drawText("next slot: NONE", pad + 8, top + 156);

        d.setTextColor(theme::TextMuted);
        d.drawText("Fix: flash a dual-slot table.", pad, top + 184);
        d.drawText("Update over USB until then.", pad, top + 196);
        break;
    }

    case State::NoWifi:
        d.setTextSize(2);
        d.setTextColor(theme::TextMuted);
        d.drawText("NO NETWORK", pad, top);
        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        d.drawText("Join a network in the WiFi app", pad, top + 30);
        d.drawText("before updating over the air.", pad, top + 44);
        break;

    case State::Ready:
        if (kernel_) kernel_->face().draw(d, W / 2, 96);
        d.setTextSize(2);
        d.setTextColor(theme::Accent);
        d.drawText("READY", (W - d.textWidth("READY")) / 2, 180);
        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        snprintf(buf, sizeof(buf), "%s.local", kHostname);
        d.drawText(buf, (W - d.textWidth(buf)) / 2, 210);
        snprintf(buf, sizeof(buf), "%s", WiFi.localIP().toString().c_str());
        d.setTextColor(theme::TextMuted);
        d.drawText(buf, (W - d.textWidth(buf)) / 2, 226);
        d.drawText("waiting for upload...", (W - d.textWidth("waiting for upload...")) / 2, 250);
        break;

    case State::Receiving: {
        d.setTextSize(2);
        d.setTextColor(theme::Accent);
        d.drawText("UPDATING", (W - d.textWidth("UPDATING")) / 2, 110);

        const int16_t bw = W - pad * 2, bh = 22;
        d.fillRoundRect(pad, 150, bw, bh, 6, theme::Surface);
        d.fillRoundRect(pad, 150, (bw * progress_) / 100, bh, 6, theme::Accent);

        snprintf(buf, sizeof(buf), "%u%%", (unsigned)progress_);
        d.setTextSize(2);
        d.setTextColor(theme::TextPrimary);
        d.drawText(buf, (W - d.textWidth(buf)) / 2, 186);

        d.setTextSize(1);
        d.setTextColor(theme::Danger);
        d.drawText("DO NOT POWER OFF", (W - d.textWidth("DO NOT POWER OFF")) / 2, 220);
        break;
    }

    case State::Done:
        d.setTextSize(2);
        d.setTextColor(theme::Success);
        d.drawText("COMPLETE", (W - d.textWidth("COMPLETE")) / 2, 140);
        d.setTextSize(1);
        d.setTextColor(theme::TextMuted);
        d.drawText("rebooting...", (W - d.textWidth("rebooting...")) / 2, 172);
        break;

    case State::Failed:
        d.setTextSize(2);
        d.setTextColor(theme::Danger);
        d.drawText("FAILED", (W - d.textWidth("FAILED")) / 2, 140);
        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        d.drawText(detail_, (W - d.textWidth(detail_)) / 2, 172);
        d.setTextColor(theme::TextMuted);
        d.drawText("A: retry", (W - d.textWidth("A: retry")) / 2, 194);
        break;
    }

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText("B: back", pad, d.height() - 14);
}

bool OtaApp::onInput(const InputReport& r) {
    if (r.event == InputEvent::SelectPress && state_ == State::Failed) {
        state_ = (WiFi.status() == WL_CONNECTED) ? State::Ready : State::NoWifi;
        progress_ = 0;
        return true;
    }
    return false;
}

}  // namespace byte_os
