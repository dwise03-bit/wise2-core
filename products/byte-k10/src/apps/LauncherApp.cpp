#include "LauncherApp.h"

#include <math.h>
#include <string.h>

#include "../core/Kernel.h"

namespace byte_os {

Status LauncherApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    return Status::pass();
}

void LauncherApp::onEnter() {
    sel_ = 0;
    scroll_ = 0.0f;
    if (kernel_) kernel_->face().setState(ByteState::Thinking);
}

// The launcher lists everything except itself and the root app (the root is
// always reachable by backing out, so listing it would be a dead entry).
uint8_t LauncherApp::visibleCount() const {
    if (!kernel_) return 0;
    uint8_t n = 0;
    for (uint8_t i = 0; i < kernel_->appCount(); ++i) {
        Application* a = kernel_->appAt(i);
        if (a == this || i == 0) continue;
        ++n;
    }
    return n;
}

Application* LauncherApp::visibleAt(uint8_t idx) const {
    if (!kernel_) return nullptr;
    uint8_t n = 0;
    for (uint8_t i = 0; i < kernel_->appCount(); ++i) {
        Application* a = kernel_->appAt(i);
        if (a == this || i == 0) continue;
        if (n == idx) return a;
        ++n;
    }
    return nullptr;
}

void LauncherApp::update(uint32_t dtMs) {
    // Smooth the highlight toward the selection so scrolling reads as motion
    // rather than teleporting. Frame-rate independent.
    const float dt = dtMs / 1000.0f;
    const float k = 1.0f - expf(-14.0f * dt);
    scroll_ += (static_cast<float>(sel_) - scroll_) * k;
}

void LauncherApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    const uint8_t n = visibleCount();

    if (n == 0) {
        d.drawTextAligned("No apps registered",
                          Rect(0, d.height() / 2 - 10, W, 20),
                          TextAlign::Center, theme::TextMuted, 1);
        return;
    }

    constexpr int16_t rowH = 44;
    constexpr int16_t pad  = 10;
    const int16_t top = DisplayManager::kStatusBarHeight + 14;

    // Highlight slides continuously behind the rows.
    const int16_t hy = top + static_cast<int16_t>(scroll_ * (rowH + 6));
    d.fillRoundRect(pad - 3, hy - 3, W - (pad - 3) * 2, rowH + 6, 10, theme::AccentDim);

    for (uint8_t i = 0; i < n; ++i) {
        Application* a = visibleAt(i);
        if (!a) continue;

        const int16_t y = top + i * (rowH + 6);
        const bool active = (i == sel_);

        d.fillRoundRect(pad, y, W - pad * 2, rowH, 8,
                        active ? theme::SurfaceAlt : theme::Surface);

        d.setTextSize(2);
        d.setTextColor(active ? theme::Accent : theme::TextPrimary);
        d.drawText(a->title(), pad + 12, y + 8);

        // Health dot: apps that failed to initialise say so here rather than
        // failing silently when opened.
        const Status h = a->health();
        Color dot = theme::Success;
        if (h.health() == Health::Warning)          dot = theme::Warning;
        else if (h.health() == Health::Error)       dot = theme::Danger;
        else if (h.health() == Health::Unavailable) dot = theme::TextMuted;
        d.fillCircle(W - pad - 14, y + rowH / 2, 4, dot);

        d.setTextSize(1);
        d.setTextColor(theme::TextMuted);
        d.drawText(a->id(), pad + 12, y + 28);
    }

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText("tilt: move   A: open   B: back", pad, d.height() - 14);
}

bool LauncherApp::onInput(const InputReport& r) {
    if (!kernel_) return false;
    const int8_t n = static_cast<int8_t>(visibleCount());
    if (n == 0) return false;

    switch (r.event) {
        case InputEvent::NavDown:
            sel_ = static_cast<int8_t>((sel_ + 1) % n);
            return true;
        case InputEvent::NavUp:
            sel_ = static_cast<int8_t>((sel_ - 1 + n) % n);
            return true;
        case InputEvent::SelectPress: {
            Application* a = visibleAt(static_cast<uint8_t>(sel_));
            if (a) kernel_->launch(a->id());
            return true;
        }
        default:
            return false;   // BackPress falls through to the kernel
    }
}

}  // namespace byte_os
