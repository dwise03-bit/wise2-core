#pragma once

#include "Application.h"

namespace byte_os {

/**
 * Live camera viewfinder (GC2145).
 *
 * The SDK's own preview path (initBgCamerImage/setBgCamerImage) builds an
 * LVGL image object and relies on the LVGL display driver owning the panel.
 * BYTE renders through its own sprite back-buffer instead, so that path is
 * unusable here. We therefore register the camera ourselves and blit frames
 * straight into the back-buffer.
 *
 * Frames arrive as RGB565 QVGA (320x240) but the panel is 240x320 portrait,
 * so we show a 240x240 centre crop — no scaling, which keeps the blit cheap
 * and the image sharp.
 *
 * The camera is only started when the app is first entered: it claims PSRAM
 * frame buffers and a DMA channel, which should not be held while the user is
 * elsewhere in the UI.
 */
class CameraApp final : public Application {
public:
    const char* id() const override    { return "camera"; }
    const char* title() const override { return "CAMERA"; }
    bool wantsStatusBar() const override { return false; }   // full-bleed

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void onExit() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    Status health() const override { return health_; }

private:
    Kernel*  kernel_ = nullptr;
    Status   health_ = Status::unavailable("not started");
    bool     started_ = false;
    bool     frozen_  = false;

    uint32_t frames_    = 0;
    uint32_t lastFpsMs_ = 0;
    float    camFps_    = 0.0f;

    // Latest frame, copied out of the driver buffer so it can be returned
    // immediately rather than held across a render pass.
    uint16_t* rgb_ = nullptr;
    bool      haveFrame_ = false;
    uint32_t  received_ = 0;
    bool      logged_ = false;

    // MEASURED, not assumed: the driver delivers 240x320 PORTRAIT RGB565
    // (len 153600 = 240*320*2). An earlier version assumed 320x240 landscape
    // and silently rejected every frame. This matches the panel exactly, so
    // there is no crop and no scaling.
    static constexpr int16_t kSrcW = 240;
    static constexpr int16_t kSrcH = 320;

    Status startCamera();
    void   stopCamera();
};

}  // namespace byte_os
