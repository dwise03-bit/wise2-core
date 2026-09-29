#include "FilesApp.h"

#include <Arduino.h>
#include <SD.h>
#include <string.h>
#include <stdio.h>

#include "../core/Kernel.h"

namespace byte_os {

Status FilesApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    health_ = Status::unavailable("card not checked yet");
    return Status::pass();
}

bool FilesApp::mount() {
    // SD.begin() is safe to call repeatedly; a card inserted after boot is
    // therefore picked up on the next entry rather than needing a reboot.
    if (SD.cardType() != CARD_NONE) { mounted_ = true; }
    else if (SD.begin()) { mounted_ = (SD.cardType() != CARD_NONE); }
    else { mounted_ = false; }

    if (mounted_) {
        cardBytes_ = SD.cardSize();
        health_ = Status::pass("card mounted");
    } else {
        cardBytes_ = 0;
        health_ = Status::unavailable("no card inserted");
    }
    return mounted_;
}

void FilesApp::onEnter() {
    sel_ = scroll_ = 0;
    snprintf(path_, sizeof(path_), "/");
    if (mount()) readDir();
    else count_ = 0;
    if (kernel_) kernel_->face().setState(ByteState::Idle);
}

void FilesApp::readDir() {
    count_ = 0;
    File dir = SD.open(path_);
    if (!dir || !dir.isDirectory()) {
        if (dir) dir.close();
        return;
    }
    File f = dir.openNextFile();
    while (f && count_ < kMaxEntries) {
        Entry& e = entries_[count_];
        const char* nm = f.name();
        // SD.open() may hand back a full path; show only the leaf.
        const char* slash = strrchr(nm, '/');
        strncpy(e.name, slash ? slash + 1 : nm, sizeof(e.name) - 1);
        e.name[sizeof(e.name) - 1] = '\0';
        e.dir  = f.isDirectory();
        e.size = e.dir ? 0 : static_cast<uint32_t>(f.size());
        ++count_;
        f.close();
        f = dir.openNextFile();
    }
    if (f) f.close();
    dir.close();
    Serial.printf("[FILES] %s -> %u entries\n", path_, (unsigned)count_);
    Serial.flush();
}

void FilesApp::enter() {
    if (sel_ >= count_ || !entries_[sel_].dir) return;
    const size_t len = strlen(path_);
    if (len + strlen(entries_[sel_].name) + 2 >= kPathMax) return;   // too deep
    if (len > 1) strncat(path_, "/", kPathMax - len - 1);
    strncat(path_, entries_[sel_].name, kPathMax - strlen(path_) - 1);
    sel_ = scroll_ = 0;
    readDir();
}

void FilesApp::up() {
    if (strcmp(path_, "/") == 0) return;
    char* slash = strrchr(path_, '/');
    if (!slash) return;
    if (slash == path_) path_[1] = '\0';   // back to root
    else *slash = '\0';
    sel_ = scroll_ = 0;
    readDir();
}

void FilesApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 8, rowH = 22;
    const int16_t top = DisplayManager::kStatusBarHeight + 18;

    if (!mounted_) {
        d.drawTextAligned("NO CARD", Rect(0, d.height() / 2 - 24, W, 20),
                          TextAlign::Center, theme::Warning, 2);
        d.drawTextAligned("insert a microSD and press A",
                          Rect(0, d.height() / 2 + 4, W, 16),
                          TextAlign::Center, theme::TextMuted, 1);
        d.setTextSize(1);
        d.setTextColor(theme::TextMuted);
        d.drawText("A: retry   B: back", pad, d.height() - 14);
        return;
    }

    // Current path
    d.setTextSize(1);
    d.setTextColor(theme::Accent);
    d.drawText(path_, pad, DisplayManager::kStatusBarHeight + 4);

    if (count_ == 0) {
        d.drawTextAligned("(empty)", Rect(0, d.height() / 2 - 8, W, 16),
                          TextAlign::Center, theme::TextMuted, 1);
    }

    char sz[16];
    for (uint8_t i = 0; i < kVisible; ++i) {
        const uint8_t idx = static_cast<uint8_t>(i + scroll_);
        if (idx >= count_) break;
        const Entry& e = entries_[idx];
        const int16_t y = top + i * rowH;
        const bool active = (idx == sel_);

        if (active) d.fillRoundRect(pad, y, W - pad * 2, rowH - 2, 4, theme::SurfaceAlt);

        d.setTextSize(1);
        d.setTextColor(e.dir ? theme::Accent : theme::TextPrimary);
        d.drawText(e.dir ? "[+]" : "   ", pad + 4, y + 6);
        d.drawText(e.name, pad + 26, y + 6);

        if (!e.dir) {
            if (e.size >= 1024UL * 1024UL)
                snprintf(sz, sizeof(sz), "%luM", (unsigned long)(e.size / (1024UL * 1024UL)));
            else if (e.size >= 1024UL)
                snprintf(sz, sizeof(sz), "%luK", (unsigned long)(e.size / 1024UL));
            else
                snprintf(sz, sizeof(sz), "%luB", (unsigned long)e.size);
            d.setTextColor(theme::TextMuted);
            d.drawText(sz, W - pad - 6 - d.textWidth(sz), y + 6);
        }
    }

    char foot[40];
    snprintf(foot, sizeof(foot), "%u items  %lluMB card",
             (unsigned)count_, cardBytes_ / (1024ULL * 1024ULL));
    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText(foot, pad, d.height() - 26);
    d.drawText("A: open   B: up/back", pad, d.height() - 14);
}

bool FilesApp::onInput(const InputReport& r) {
    if (!mounted_) {
        if (r.event == InputEvent::SelectPress) {
            if (mount()) readDir();
            return true;
        }
        return false;
    }

    switch (r.event) {
        case InputEvent::NavDown:
            if (!count_) return true;
            sel_ = static_cast<int8_t>((sel_ + 1) % count_);
            if (sel_ >= scroll_ + kVisible) scroll_ = sel_ - kVisible + 1;
            if (sel_ == 0) scroll_ = 0;
            return true;
        case InputEvent::NavUp:
            if (!count_) return true;
            sel_ = static_cast<int8_t>((sel_ - 1 + count_) % count_);
            if (sel_ < scroll_) scroll_ = sel_;
            return true;
        case InputEvent::SelectPress:
            enter();
            return true;
        case InputEvent::BackPress:
            // Back climbs the tree first, and only leaves the app at root.
            if (strcmp(path_, "/") != 0) { up(); return true; }
            return false;
        default:
            return false;
    }
}

}  // namespace byte_os
