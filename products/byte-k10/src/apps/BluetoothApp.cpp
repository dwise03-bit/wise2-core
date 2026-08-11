#include "BluetoothApp.h"

#include <Arduino.h>
#include <string.h>
#include <stdio.h>

#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

#include "../core/Kernel.h"

namespace byte_os {

namespace {
BLEScan* gScan = nullptr;
constexpr uint32_t kScanSeconds = 4;
}

Status BluetoothApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    // BLEDevice::init() claims a sizeable chunk of heap and starts the
    // controller, so it is deferred until the app is actually opened.
    health_ = Status::unavailable("BLE idle until opened");
    return Status::pass();
}

void BluetoothApp::onEnter() {
    sel_ = scroll_ = 0;
    count_ = 0;
    if (!started_) {
        BLEDevice::init("BYTE-K10");
        gScan = BLEDevice::getScan();
        gScan->setActiveScan(true);
        gScan->setInterval(100);
        gScan->setWindow(99);
        started_ = true;
        health_ = Status::pass("BLE controller up");
        Serial.println("[BLE] controller initialised");
        Serial.flush();
    }
    if (kernel_) kernel_->face().setState(ByteState::Listening);
    startScan();
}

void BluetoothApp::onExit() {
    if (gScan && scanning_) {
        gScan->stop();
        scanning_ = false;
    }
    if (kernel_) kernel_->face().setState(ByteState::Idle);
}

void BluetoothApp::startScan() {
    if (!gScan || scanning_) return;
    count_ = 0;
    scanning_ = true;
    scanStartMs_ = millis();
    // Non-blocking form: results are collected when the burst completes.
    gScan->start(kScanSeconds, nullptr, false);
}

void BluetoothApp::collect() {
    // This core's getResults() returns by value, not by pointer.
    BLEScanResults res = gScan->getResults();
    const int n = res.getCount();
    count_ = 0;
    for (int i = 0; i < n && count_ < kMaxDev; ++i) {
        BLEAdvertisedDevice d = res.getDevice(i);
        Dev& out = devs_[count_];
        const std::string nm = d.getName();
        if (!nm.empty()) {
            strncpy(out.name, nm.c_str(), sizeof(out.name) - 1);
            out.name[sizeof(out.name) - 1] = '\0';
        } else {
            snprintf(out.name, sizeof(out.name), "(no name)");
        }
        strncpy(out.addr, d.getAddress().toString().c_str(), sizeof(out.addr) - 1);
        out.addr[sizeof(out.addr) - 1] = '\0';
        out.rssi = static_cast<int8_t>(d.getRSSI());
        ++count_;
    }
    gScan->clearResults();
    Serial.printf("[BLE] scan found %u device(s)\n", (unsigned)count_);
    Serial.flush();
}

void BluetoothApp::update(uint32_t dtMs) {
    (void)dtMs;
    if (!scanning_) return;
    // The burst is time-bounded; poll for its end rather than blocking on it.
    if (millis() - scanStartMs_ < (kScanSeconds * 1000UL + 250)) return;
    scanning_ = false;
    collect();
}

void BluetoothApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 8, rowH = 24;
    const int16_t top = DisplayManager::kStatusBarHeight + 6;

    if (count_ == 0) {
        d.drawTextAligned(scanning_ ? "scanning..." : "nothing found - A to rescan",
                          Rect(0, d.height() / 2 - 8, W, 16),
                          TextAlign::Center, theme::TextMuted, 1);
    } else {
        for (uint8_t i = 0; i < kVisible; ++i) {
            const uint8_t idx = static_cast<uint8_t>(i + scroll_);
            if (idx >= count_) break;
            const Dev& v = devs_[idx];
            const int16_t y = top + i * rowH;
            const bool active = (idx == sel_);

            d.fillRoundRect(pad, y, W - pad * 2, rowH - 3, 4,
                            active ? theme::SurfaceAlt : theme::Surface);
            d.setTextSize(1);
            d.setTextColor(active ? theme::Accent : theme::TextPrimary);
            d.drawText(v.name, pad + 6, y + 3);
            d.setTextColor(theme::TextMuted);
            d.drawText(v.addr, pad + 6, y + 13);

            char rs[10];
            snprintf(rs, sizeof(rs), "%d", (int)v.rssi);
            d.drawText(rs, W - pad - 8 - d.textWidth(rs), y + 8);
        }
    }

    char foot[32];
    snprintf(foot, sizeof(foot), "%u found", (unsigned)count_);
    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText(foot, pad, d.height() - 26);
    d.drawText("A: rescan   B: back", pad, d.height() - 14);
}

bool BluetoothApp::onInput(const InputReport& r) {
    if (r.event == InputEvent::SelectPress) { startScan(); return true; }
    if (r.event == InputEvent::NavDown && count_) {
        sel_ = static_cast<int8_t>((sel_ + 1) % count_);
        if (sel_ >= scroll_ + kVisible) scroll_ = sel_ - kVisible + 1;
        if (sel_ == 0) scroll_ = 0;
        return true;
    }
    if (r.event == InputEvent::NavUp && count_) {
        sel_ = static_cast<int8_t>((sel_ - 1 + count_) % count_);
        if (sel_ < scroll_) scroll_ = sel_;
        return true;
    }
    return false;
}

}  // namespace byte_os
