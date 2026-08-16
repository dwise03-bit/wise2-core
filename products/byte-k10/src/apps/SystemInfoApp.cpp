#include "SystemInfoApp.h"

#include <Arduino.h>
#include <WiFi.h>
#include <stdio.h>

#include "../core/Kernel.h"
#include "../hardware/K10Pins.h"

namespace byte_os {

Status SystemInfoApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    return Status::pass();
}

void SystemInfoApp::rowText(uint8_t i, char* key, size_t kn, char* val, size_t vn) const {
    switch (i) {
        case 0:
            snprintf(key, kn, "Firmware");
            snprintf(val, vn, "BYTE 4.0");
            break;
        case 1:
            snprintf(key, kn, "Built");
            snprintf(val, vn, "%s", __DATE__);
            break;
        case 2:
            snprintf(key, kn, "Board");
            snprintf(val, vn, "UNIHIKER K10");
            break;
        case 3:
            snprintf(key, kn, "Chip");
            snprintf(val, vn, "%s r%d", ESP.getChipModel(), ESP.getChipRevision());
            break;
        case 4:
            snprintf(key, kn, "Cores");
            snprintf(val, vn, "%d @ %luMHz", ESP.getChipCores(),
                     (unsigned long)ESP.getCpuFreqMHz());
            break;
        case 5:
            snprintf(key, kn, "Free heap");
            snprintf(val, vn, "%lu KB", (unsigned long)(ESP.getFreeHeap() / 1024));
            break;
        case 6:
            snprintf(key, kn, "Min heap");
            snprintf(val, vn, "%lu KB", (unsigned long)(ESP.getMinFreeHeap() / 1024));
            break;
        case 7:
            snprintf(key, kn, "PSRAM free");
            snprintf(val, vn, "%lu KB", (unsigned long)(ESP.getFreePsram() / 1024));
            break;
        case 8:
            snprintf(key, kn, "PSRAM size");
            snprintf(val, vn, "%lu KB", (unsigned long)(ESP.getPsramSize() / 1024));
            break;
        case 9:
            snprintf(key, kn, "Flash");
            snprintf(val, vn, "%lu MB", (unsigned long)(ESP.getFlashChipSize() / (1024 * 1024)));
            break;
        case 10:
            snprintf(key, kn, "Sketch");
            snprintf(val, vn, "%lu KB", (unsigned long)(ESP.getSketchSize() / 1024));
            break;
        case 11:
            snprintf(key, kn, "MAC");
            snprintf(val, vn, "%s", WiFi.macAddress().c_str());
            break;
        case 12: {
            const uint32_t up = kernel_ ? kernel_->uptimeSec() : 0;
            snprintf(key, kn, "Uptime");
            snprintf(val, vn, "%luh %02lum %02lus",
                     (unsigned long)(up / 3600), (unsigned long)((up % 3600) / 60),
                     (unsigned long)(up % 60));
            break;
        }
        case 13:
            snprintf(key, kn, "Display");
            snprintf(val, vn, "ILI9341 %dx%d", k10::kScreenWidth, k10::kScreenHeight);
            break;
        case 14:
            snprintf(key, kn, "Touch");
            snprintf(val, vn, "none");
            break;
        case 15:
            snprintf(key, kn, "Battery");
            snprintf(val, vn, "n/a");
            break;
        case 16:
            snprintf(key, kn, "QR");
            snprintf(val, vn, "AIRecognition");
            break;
        default:
            key[0] = val[0] = '\0';
            break;
    }
}

void SystemInfoApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 8, rowH = 20;
    const int16_t top = DisplayManager::kStatusBarHeight + 6;
    const uint8_t visible = 12;

    char key[24], val[32];
    for (uint8_t i = 0; i < visible; ++i) {
        const uint8_t idx = static_cast<uint8_t>(i + scroll_);
        if (idx >= kRows) break;
        rowText(idx, key, sizeof(key), val, sizeof(val));

        const int16_t y = top + i * rowH;
        if (i & 1) d.fillRect(pad, y, W - pad * 2, rowH, theme::Surface);

        d.setTextSize(1);
        d.setTextColor(theme::TextMuted);
        d.drawText(key, pad + 6, y + 6);

        d.setTextColor(theme::TextPrimary);
        d.drawText(val, W - pad - 6 - d.textWidth(val), y + 6);
    }

    if (kRows > visible) {
        // Scroll indicator
        const int16_t trackH = visible * rowH;
        const int16_t thumbH = (trackH * visible) / kRows;
        const int16_t thumbY = top + (trackH * scroll_) / kRows;
        d.fillRect(W - 3, top, 2, trackH, theme::Surface);
        d.fillRect(W - 3, thumbY, 2, thumbH, theme::Accent);
    }

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText("tilt: scroll   B: back", pad, d.height() - 14);
}

bool SystemInfoApp::onInput(const InputReport& r) {
    constexpr int8_t maxScroll = kRows - 12;
    if (r.event == InputEvent::NavDown) {
        if (scroll_ < maxScroll) ++scroll_;
        return true;
    }
    if (r.event == InputEvent::NavUp) {
        if (scroll_ > 0) --scroll_;
        return true;
    }
    return false;
}

}  // namespace byte_os
