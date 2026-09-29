#include "TerminalApp.h"

#include <string.h>
#include <stdio.h>

#include "../core/Kernel.h"
#include "../core/Logger.h"

namespace byte_os {

Status TerminalApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    return Status::pass();
}

void TerminalApp::onEnter() {
    follow_ = true;
    scroll_ = 0;
    if (kernel_) kernel_->face().setState(ByteState::Thinking);
}

void TerminalApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    Logger& log = Logger::instance();
    const uint8_t total = log.count();
    constexpr int16_t pad = 4, rowH = 11;
    const int16_t top = DisplayManager::kStatusBarHeight + 4;

    if (total == 0) {
        d.drawTextAligned("(log empty)", Rect(0, d.height() / 2 - 8, W, 16),
                          TextAlign::Center, theme::TextMuted, 1);
        return;
    }

    // Following the tail means the window sits at the end of the buffer.
    int16_t first = follow_ ? static_cast<int16_t>(total) - kRows : scroll_;
    if (first < 0) first = 0;
    if (first > static_cast<int16_t>(total) - 1) first = total - 1;

    d.setTextSize(1);
    for (uint8_t i = 0; i < kRows; ++i) {
        const int16_t idx = first + i;
        if (idx >= static_cast<int16_t>(total)) break;
        const char* text = log.line(static_cast<uint8_t>(idx));

        // Colour by severity so failures stand out at a glance.
        Color c = theme::TextMuted;
        if (strstr(text, "ERROR") || strstr(text, "FATAL") || strstr(text, "fail")) c = theme::Danger;
        else if (strstr(text, "WARN")) c = theme::Warning;
        else if (strstr(text, "PASS") || strstr(text, "ok"))  c = theme::Success;
        else if (text[0] == '[') c = theme::TextPrimary;

        d.setTextColor(c);
        d.drawText(text, pad, top + i * rowH);
    }

    // Scrollbar
    if (total > kRows) {
        const int16_t trackH = kRows * rowH;
        const int16_t thumbH = (trackH * kRows) / total;
        const int16_t thumbY = top + (trackH * first) / total;
        d.fillRect(W - 3, top, 2, trackH, theme::Surface);
        d.fillRect(W - 3, thumbY, 2, thumbH < 6 ? 6 : thumbH, theme::Accent);
    }

    char foot[40];
    snprintf(foot, sizeof(foot), "%u lines  %s", (unsigned)total,
             follow_ ? "following" : "paused");
    d.setTextColor(theme::TextMuted);
    d.drawText(foot, pad, d.height() - 26);
    d.drawText("tilt: scroll   A: follow   B: back", pad, d.height() - 14);
}

bool TerminalApp::onInput(const InputReport& r) {
    Logger& log = Logger::instance();
    const int16_t total = static_cast<int16_t>(log.count());
    const int16_t maxFirst = total > kRows ? total - kRows : 0;

    switch (r.event) {
        case InputEvent::NavUp:
            // Scrolling up pins the view; otherwise new lines would drag the
            // window away while you are reading.
            if (follow_) { scroll_ = maxFirst; follow_ = false; }
            if (scroll_ > 0) --scroll_;
            return true;
        case InputEvent::NavDown:
            if (follow_) return true;
            if (scroll_ < maxFirst) ++scroll_;
            if (scroll_ >= maxFirst) follow_ = true;   // reaching the end resumes
            return true;
        case InputEvent::SelectPress:
            follow_ = true;
            return true;
        case InputEvent::SelectLongPress:
            log.clear();
            follow_ = true;
            scroll_ = 0;
            return true;
        default:
            return false;
    }
}

}  // namespace byte_os
