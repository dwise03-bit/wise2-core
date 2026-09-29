#include "DashboardApp.h"

#include <Arduino.h>
#include <stdio.h>
#include <stdlib.h>

#include "../core/Kernel.h"
#include "unihiker_k10.h"
#include "../input/InputManager_K10.h"

namespace byte_os {

DashboardApp::DashboardApp(UNIHIKER_K10& board)
    : board_(board) {}

Status DashboardApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    haveAht_ = false;
    health_ = Status::warning("temp/humidity disabled in demo build");
    return health_;
}

void DashboardApp::onEnter() {
    if (kernel_) kernel_->face().setState(ByteState::Idle);
    lastSensorMs_ = 0;   // force an immediate refresh
}

void DashboardApp::update(uint32_t dtMs) {
    (void)dtMs;
    const uint32_t now = millis();

    // Sensors are on I2C; 2Hz is plenty and keeps the bus off the frame path.
    if (now - lastSensorMs_ < 500) return;
    lastSensorMs_ = now;

    tempC_ = 0.0f;
    humidity_ = 0.0f;
    lux_ = readLuxSafe();

    if (kernel_) kernel_->input().acceleration(ax_, ay_, az_);
}

/**
 * Ambient light in lux, replacing UNIHIKER_K10::readALS().
 *
 * The SDK version is unsafe. It computes
 *     _ratio = _als_ch1 / (_als_ch0 + _als_ch1);
 * with two uint16_t operands, which is INTEGER division:
 *
 *   1. In darkness both channels read 0, so the divisor is 0 and the board
 *      dies with IntegerDivideByZero. This reproduces reliably by covering
 *      the sensor, and it panicked the render core during bring-up.
 *   2. Even in light, ch1 < (ch0 + ch1) always, so the integer result is
 *      always 0 and the lux formula permanently takes its first branch.
 *
 * We read the same registers via the SDK's public readData() and do the
 * arithmetic in floating point with an explicit zero guard. Coefficients are
 * the vendor's, kept so readings stay comparable.
 */
uint16_t DashboardApp::readLuxSafe() {
    uint8_t buf[4];
    if (board_.readData(LTR303ALS_ADDR, LTR303_DATA_CH1_0, buf, 4) != 4) {
        luxOk_ = false;
        return 0;
    }
    const uint16_t ch1 = static_cast<uint16_t>((buf[1] << 8) | buf[0]);
    const uint16_t ch0 = static_cast<uint16_t>((buf[3] << 8) | buf[2]);
    const uint32_t sum = static_cast<uint32_t>(ch0) + ch1;

    luxOk_ = true;
    if (sum == 0) return 0;                       // darkness, not a crash

    const float ratio = static_cast<float>(ch1) / static_cast<float>(sum);
    float lux;
    if (ratio < 0.45f)      lux = 1.7743f * ch0 + 1.1059f * ch1;
    else if (ratio < 0.64f) lux = 4.2785f * ch0 - 1.9548f * ch1;
    else if (ratio < 0.85f) lux = 0.5926f * ch0 + 0.1185f * ch1;
    else                    lux = 0.0f;

    if (lux < 0.0f) lux = 0.0f;                   // clamp: branch 2 can go negative
    if (lux > 65535.0f) lux = 65535.0f;
    return static_cast<uint16_t>(lux);
}

void DashboardApp::drawCard(DisplayManager& d, Rect box, const char* label,
                            const char* value, Color valueColor) {
    d.fillRoundRect(box.x, box.y, box.w, box.h, 8, theme::Surface);

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText(label, box.x + 8, box.y + 7);

    d.setTextSize(2);
    d.setTextColor(valueColor);
    d.drawText(value, box.x + 8, box.y + 22);
}

void DashboardApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    char buf[32];
    constexpr int16_t pad = 10;
    int16_t y = 42;

    // Bring-up mode: use only primitives already proven by the boot splash
    // (solid rects + text). Once this is visibly stable on hardware, the face
    // and rounded-card layout can be added back incrementally.
    d.setTextSize(1);
    d.setTextColor(theme::TextPrimary);
    d.drawText("BYTE DASHBOARD", pad, y);
    y += 18;

    d.fillRect(pad, y, W - pad * 2, 2, theme::Accent);
    y += 14;

    d.setTextColor(theme::Accent);
    if (haveAht_) snprintf(buf, sizeof(buf), "temp %.1fC", tempC_);
    else          snprintf(buf, sizeof(buf), "temp n/a");
    d.drawText(buf, pad, y);
    y += 18;

    d.setTextColor(theme::ChromeBright);
    if (haveAht_) snprintf(buf, sizeof(buf), "humidity %.0f%%", humidity_);
    else          snprintf(buf, sizeof(buf), "humidity n/a");
    d.drawText(buf, pad, y);
    y += 18;

    d.setTextColor(theme::Success);
    snprintf(buf, sizeof(buf), "light %u lux", (unsigned)lux_);
    d.drawText(buf, pad, y);
    y += 18;

    const int mag = abs(ax_) + abs(ay_) + abs(az_);
    const bool moving = mag > 1500;
    d.setTextColor(moving ? theme::Warning : theme::Chrome);
    snprintf(buf, sizeof(buf), "motion %s", moving ? "MOVE" : "STILL");
    d.drawText(buf, pad, y);
    y += 18;

    const uint32_t up = kernel_ ? kernel_->uptimeSec() : 0;
    d.setTextColor(theme::TextMuted);
    snprintf(buf, sizeof(buf), "uptime %lum%02lus",
             (unsigned long)(up / 60), (unsigned long)(up % 60));
    d.drawText(buf, pad, y);

    d.setTextColor(theme::TextMuted);
    d.drawText("A:apps  B:diag", pad, d.height() - 14);
}

bool DashboardApp::onInput(const InputReport& r) {
    if (!kernel_) return false;

    switch (r.event) {
        case InputEvent::SelectPress:
            kernel_->launch("launcher");
            return true;

        case InputEvent::SelectLongPress:
            // Long-press is a shortcut straight to Settings.
            kernel_->launch("settings");
            return true;

        case InputEvent::BackPress:
            // Root-level Back looked broken because the kernel does not pop
            // below the dashboard. Give B an explicit, visible action here.
            kernel_->launch("diag");
            return true;

        case InputEvent::BackLongPress:
            kernel_->launch("voice");
            return true;

        case InputEvent::MenuPress:
            // A+B re-learns "level" wherever the board is now sitting.
            static_cast<InputManager_K10&>(kernel_->input()).recalibrate();
            kernel_->face().setState(ByteState::Thinking);
            return true;

        case InputEvent::Shake:
            kernel_->face().setState(ByteState::Error);
            return true;

        case InputEvent::NavLeft:
            kernel_->face().lookAt(-1.0f, 0.0f);
            return true;
        case InputEvent::NavRight:
            kernel_->face().lookAt(1.0f, 0.0f);
            return true;
        case InputEvent::NavUp:
            kernel_->face().lookAt(0.0f, -1.0f);
            return true;
        case InputEvent::NavDown:
            kernel_->face().lookAt(0.0f, 1.0f);
            return true;

        default:
            return false;
    }
}

}  // namespace byte_os
