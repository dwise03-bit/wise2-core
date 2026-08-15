#pragma once

#ifdef BYTE_ENABLE_QR_SCANNER

#include "Application.h"

class UNIHIKER_K10;
class AIRecognition;

namespace byte_os {

/**
 * QR scanner demo.
 *
 * Uses the K10 vendor AIRecognition pipeline in code mode so the built-in
 * camera can look for QR payloads while the main UI stays lightweight.
 * The actual camera preview remains available in the Camera app; this demo is
 * focused on scan/confirm/capture.
 */
class QrScannerApp final : public Application {
public:
    explicit QrScannerApp(UNIHIKER_K10& board);

    const char* id() const override    { return "qr"; }
    const char* title() const override { return "QR SCANNER"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void onExit() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    Status health() const override { return health_; }

private:
    UNIHIKER_K10& board_;
    Kernel*       kernel_ = nullptr;
    Status        health_;
    bool          started_ = false;
    bool          detected_ = false;
    uint32_t      detectMs_ = 0;
    char          code_[200] = {0};

    void startScanner();
    void stopScanner();
};

}  // namespace byte_os

#endif  // BYTE_ENABLE_QR_SCANNER
