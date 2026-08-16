#include "SettingsApp.h"

#include <stdio.h>

#include "../core/Kernel.h"
#include "../system/SettingsStore.h"

namespace byte_os {

namespace {
const char* kLabels[] = {
    "Brightness", "Doze after", "Sleep after",
    "Animations", "Developer mode", "Factory reset",
};
// Offered idle durations in seconds; 0 means "never".
const uint16_t kDoze[]  = {0, 15, 30, 60, 120, 300};
const uint16_t kSleep[] = {0, 60, 300, 600, 1800};

template <size_t N>
uint8_t nearestIndex(const uint16_t (&arr)[N], uint16_t v) {
    uint8_t best = 0;
    uint32_t bestD = 0xFFFFFFFF;
    for (uint8_t i = 0; i < N; ++i) {
        const uint32_t d = (arr[i] > v) ? arr[i] - v : v - arr[i];
        if (d < bestD) { bestD = d; best = i; }
    }
    return best;
}
}  // namespace

SettingsApp::SettingsApp(SettingsStore& store) : store_(store) {}

Status SettingsApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    applyToKernel();
    return Status::pass();
}

void SettingsApp::onEnter() {
    sel_ = 0;
    confirmReset_ = false;
    if (kernel_) kernel_->face().setState(ByteState::Idle);
}

void SettingsApp::applyToKernel() {
    if (!kernel_) return;
    kernel_->setIdleTimeouts(static_cast<uint32_t>(store_.dozeSec()) * 1000UL,
                             static_cast<uint32_t>(store_.sleepSec()) * 1000UL);
    kernel_->display().setBrightness(store_.brightness());
}

void SettingsApp::valueText(uint8_t row, char* out, size_t n) const {
    switch (row) {
        case RowBrightness:
            snprintf(out, n, "%u%%", (unsigned)((store_.brightness() * 100) / 255));
            break;
        case RowDoze:
            if (store_.dozeSec() == 0) snprintf(out, n, "never");
            else snprintf(out, n, "%us", (unsigned)store_.dozeSec());
            break;
        case RowSleep:
            if (store_.sleepSec() == 0) snprintf(out, n, "never");
            else if (store_.sleepSec() >= 60) snprintf(out, n, "%umin", (unsigned)(store_.sleepSec() / 60));
            else snprintf(out, n, "%us", (unsigned)store_.sleepSec());
            break;
        case RowAnimations:  snprintf(out, n, store_.animations() ? "on" : "off"); break;
        case RowDeveloper:   snprintf(out, n, store_.developerMode() ? "on" : "off"); break;
        case RowFactoryReset:snprintf(out, n, confirmReset_ ? "CONFIRM?" : "hold A"); break;
        default:             snprintf(out, n, "-"); break;
    }
}

void SettingsApp::adjust(int dir) {
    switch (sel_) {
        case RowBrightness: {
            int v = store_.brightness() + dir * 51;      // ~20% steps
            if (v < 51)  v = 51;                          // never fully dark here
            if (v > 255) v = 255;
            store_.setBrightness(static_cast<uint8_t>(v));
            break;
        }
        case RowDoze: {
            uint8_t i = nearestIndex(kDoze, store_.dozeSec());
            const int8_t ni = static_cast<int8_t>(i) + dir;
            if (ni >= 0 && ni < (int8_t)(sizeof(kDoze) / sizeof(kDoze[0])))
                store_.setDozeSec(kDoze[ni]);
            break;
        }
        case RowSleep: {
            uint8_t i = nearestIndex(kSleep, store_.sleepSec());
            const int8_t ni = static_cast<int8_t>(i) + dir;
            if (ni >= 0 && ni < (int8_t)(sizeof(kSleep) / sizeof(kSleep[0])))
                store_.setSleepSec(kSleep[ni]);
            break;
        }
        case RowAnimations: store_.setAnimations(!store_.animations()); break;
        case RowDeveloper:  store_.setDeveloperMode(!store_.developerMode()); break;
        default: return;
    }
    applyToKernel();
}

void SettingsApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 8;
    constexpr int16_t rowH = 34;
    const int16_t top = DisplayManager::kStatusBarHeight + 8;

    char val[16];
    for (uint8_t i = 0; i < RowCount; ++i) {
        const int16_t y = top + i * (rowH + 4);
        const bool active = (i == sel_);
        const bool danger = (i == RowFactoryReset);

        d.fillRoundRect(pad, y, W - pad * 2, rowH, 7,
                        active ? theme::SurfaceAlt : theme::Surface);
        if (active) d.drawRoundRect(pad, y, W - pad * 2, rowH, 7,
                                    danger ? theme::Danger : theme::Accent);

        d.setTextSize(1);
        d.setTextColor(danger ? theme::Danger : theme::TextPrimary);
        d.drawText(kLabels[i], pad + 10, y + 13);

        valueText(i, val, sizeof(val));
        d.setTextSize(1);
        d.setTextColor(active ? theme::Accent : theme::TextMuted);
        d.drawText(val, W - pad - 12 - d.textWidth(val), y + 13);
    }

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText(confirmReset_ ? "A again = ERASE   B: cancel"
                             : "tilt: move/change   B: back",
               pad, d.height() - 14);
}

bool SettingsApp::onInput(const InputReport& r) {
    switch (r.event) {
        case InputEvent::NavDown:
            sel_ = static_cast<uint8_t>((sel_ + 1) % RowCount);
            confirmReset_ = false;      // moving away cancels a pending reset
            return true;
        case InputEvent::NavUp:
            sel_ = static_cast<uint8_t>((sel_ + RowCount - 1) % RowCount);
            confirmReset_ = false;
            return true;
        case InputEvent::NavRight:
            adjust(+1);
            return true;
        case InputEvent::NavLeft:
            adjust(-1);
            return true;

        case InputEvent::SelectPress:
            if (sel_ == RowFactoryReset) {
                // Two-step: arm, then confirm. Destructive actions must never
                // be one accidental tilt away.
                if (!confirmReset_) {
                    confirmReset_ = true;
                } else {
                    confirmReset_ = false;
                    store_.factoryReset();
                    applyToKernel();
                    if (kernel_) kernel_->face().setState(ByteState::Happy);
                }
            } else {
                adjust(+1);
            }
            return true;

        case InputEvent::BackPress:
            if (confirmReset_) { confirmReset_ = false; return true; }
            return false;       // let the kernel pop the stack

        default:
            return false;
    }
}

}  // namespace byte_os
