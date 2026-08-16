#ifdef BYTE_ENABLE_QR_SCANNER

#include "QrScannerApp.h"

#include <Arduino.h>
#include <string.h>
#include <stdio.h>

#include "../core/Kernel.h"
#include "unihiker_k10.h"
#include "AIRecognition.h"

namespace byte_os {

namespace {
AIRecognition gAi;
}

QrScannerApp::QrScannerApp(UNIHIKER_K10& board) : board_(board) {}

Status QrScannerApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    health_ = Status::unavailable("camera idle until opened");
    return Status::pass();
}

void QrScannerApp::startScanner() {
    if (started_) return;

    gAi.initAi();
    board_.initBgCamerImage();
    board_.setBgCamerImage(false);
    gAi.switchAiMode(AIRecognition::NoMode);

    started_ = true;
    health_ = Status::pass("QR scanner ready");
    Serial.println("[QR] scanner initialised");
    Serial.flush();
}

void QrScannerApp::stopScanner() {
    if (!started_) return;
    gAi.switchAiMode(AIRecognition::NoMode);
    board_.setBgCamerImage(false);
}

void QrScannerApp::onEnter() {
    detected_ = false;
    detectMs_ = 0;
    startScanner();
    gAi.switchAiMode(AIRecognition::Code);
    if (kernel_) kernel_->face().setState(ByteState::Thinking);
}

void QrScannerApp::onExit() {
    stopScanner();
    if (kernel_) kernel_->face().setState(ByteState::Idle);
}

void QrScannerApp::update(uint32_t dtMs) {
    (void)dtMs;
    if (!started_) return;

    if (gAi.isDetectContent(AIRecognition::Code)) {
        String s = gAi.getQrCodeContent();
        if (s.length() > 0) {
            strncpy(code_, s.c_str(), sizeof(code_) - 1);
            code_[sizeof(code_) - 1] = '\0';
            detected_ = true;
            detectMs_ = millis();
            if (kernel_) kernel_->face().setState(ByteState::Happy);
        }
    }

    if (detected_ && millis() - detectMs_ > 2500) {
        detected_ = false;
        code_[0] = '\0';
        gAi.switchAiMode(AIRecognition::Code);
    }
}

void QrScannerApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 10;
    const int16_t top = DisplayManager::kStatusBarHeight + 16;

    d.fillRoundRect(pad, top, W - pad * 2, 92, 10, theme::Surface);
    d.setTextSize(2);
    d.setTextColor(theme::Accent);
    d.drawText("QR SCANNER", pad + 12, top + 12);

    d.setTextSize(1);
    d.setTextColor(theme::TextPrimary);
    d.drawText("point a code at the camera", pad + 12, top + 38);
    d.drawText("and hold steady", pad + 12, top + 50);

    d.setTextColor(theme::TextMuted);
    d.drawText(started_ ? "camera + ai active" : "starting...", pad + 12, top + 70);

    d.fillRoundRect(pad, top + 108, W - pad * 2, 88, 10,
                    detected_ ? theme::SurfaceAlt : theme::Surface);
    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText("result", pad + 12, top + 120);

    if (detected_ && code_[0]) {
        d.setTextSize(2);
        d.setTextColor(theme::Success);
        d.drawTextAligned("LEAD CAPTURED", Rect(pad + 12, top + 136, W - 24, 22),
                          TextAlign::Left, theme::Success, 2);
        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        d.drawText(code_, pad + 12, top + 166);
    } else {
        d.setTextSize(2);
        d.setTextColor(theme::TextMuted);
        d.drawText("SCANNING", pad + 12, top + 146);
    }

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText("A: rescan   B: back", pad, d.height() - 14);
}

bool QrScannerApp::onInput(const InputReport& r) {
    if (r.event == InputEvent::SelectPress) {
        detected_ = false;
        code_[0] = '\0';
        gAi.switchAiMode(AIRecognition::Code);
        return true;
    }
    return false;
}

}  // namespace byte_os

#endif  // BYTE_ENABLE_QR_SCANNER
