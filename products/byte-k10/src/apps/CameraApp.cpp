#include "CameraApp.h"

#include <Arduino.h>
#include <stdio.h>

#include "../core/Kernel.h"
#include "unihiker_k10.h"
#include "esp_camera.h"

namespace byte_os {

namespace {
QueueHandle_t gFrameQueue = nullptr;
}

Status CameraApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    // Nothing is claimed until the app is entered; report honestly until then.
    health_ = Status::unavailable("camera idle until opened");
    return Status::pass();
}

Status CameraApp::startCamera() {
    if (started_) return health_;

    // A 240x320 RGB565 frame = 150 KB. Internal SRAM is precious (the
    // display back-buffer already holds 150 KB of it), so this lives in PSRAM.
    if (rgb_ == nullptr) {
        rgb_ = static_cast<uint16_t*>(
            heap_caps_malloc(kSrcW * kSrcH * sizeof(uint16_t), MALLOC_CAP_SPIRAM));
        if (rgb_ == nullptr) {
            health_ = Status::error("frame buffer alloc failed");
            return health_;
        }
    }

    if (gFrameQueue == nullptr) {
        gFrameQueue = xQueueCreate(2, sizeof(camera_fb_t*));
        if (gFrameQueue == nullptr) {
            health_ = Status::error("frame queue alloc failed");
            return health_;
        }
    }

    // Pin assignments live inside the board's prebuilt who_camera module —
    // register_camera() takes no pin arguments, so there is nothing to guess.
    register_camera(PIXFORMAT_RGB565, FRAMESIZE_QVGA, 2, gFrameQueue);

    started_ = true;
    lastFpsMs_ = millis();
    frames_ = 0;
    health_ = Status::pass("GC2145 QVGA RGB565");
    return health_;
}

void CameraApp::stopCamera() {
    // The SDK offers no deregister; we simply stop draining the queue. Frames
    // still arriving are returned immediately in update() when not entered.
    started_ = false;
    haveFrame_ = false;
}

void CameraApp::onEnter() {
    frozen_ = false;
    const Status s = startCamera();
    Serial.printf("[CAM] start: %s (%s)\n", s.label(), s.detail());
    Serial.flush();
    if (kernel_) kernel_->face().setState(ByteState::Listening);
}

void CameraApp::onExit() {
    stopCamera();
}

void CameraApp::update(uint32_t dtMs) {
    (void)dtMs;
    if (!started_ || gFrameQueue == nullptr) return;

    camera_fb_t* fb = nullptr;
    // Non-blocking: the render loop must never stall waiting on a frame.
    while (xQueueReceive(gFrameQueue, &fb, 0) == pdTRUE && fb != nullptr) {
        ++received_;
        // Report what the driver actually hands us. A frame whose geometry or
        // format does not match is otherwise dropped silently, which looks
        // identical to "no frames arriving at all".
        if (!logged_) {
            logged_ = true;
            Serial.printf("[CAM] first frame %ux%u fmt=%d len=%u\n",
                          (unsigned)fb->width, (unsigned)fb->height,
                          (int)fb->format, (unsigned)fb->len);
            Serial.flush();
        }
        if (!frozen_ && rgb_ && fb->width == kSrcW && fb->height == kSrcH &&
            fb->format == PIXFORMAT_RGB565) {
            // Frame geometry matches the panel: one straight copy, no crop.
            memcpy(rgb_, fb->buf, kSrcW * kSrcH * sizeof(uint16_t));
            haveFrame_ = true;

            ++frames_;
            const uint32_t now = millis();
            if (now - lastFpsMs_ >= 1000) {
                camFps_ = (frames_ * 1000.0f) / (now - lastFpsMs_);
                frames_ = 0;
                lastFpsMs_ = now;
            }
        }
        // Always return the driver buffer, even when frozen or mismatched —
        // holding one starves the camera and the pipeline stalls.
        esp_camera_fb_return(fb);
        fb = nullptr;
    }
}

void CameraApp::draw(DisplayManager& d) {
    // Surface the receive count so "no image" can be told apart from
    // "frames arriving but rejected".

    const int16_t W = d.width();

    if (haveFrame_ && rgb_) {
        d.drawImage(0, 0, kSrcW, kSrcH, rgb_);   // full-bleed, native size
    } else {
        char msg[48];
        snprintf(msg, sizeof(msg), started_ ? "waiting... rx=%lu" : "camera unavailable",
                 (unsigned long)received_);
        d.drawTextAligned(msg, Rect(0, d.height() / 2 - 8, W, 16),
                          TextAlign::Center,
                          started_ ? theme::TextMuted : theme::Danger, 1);
    }

    // Overlay bar
    char info[40];
    snprintf(info, sizeof(info), "%s  %.0f fps", frozen_ ? "FROZEN" : "LIVE", camFps_);
    d.fillRect(0, 0, W, 16, theme::Surface);
    d.setTextSize(1);
    d.setTextColor(frozen_ ? theme::Warning : theme::Success);
    d.drawText(info, 6, 4);

    d.fillRect(0, d.height() - 16, W, 16, theme::Surface);
    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText("A: freeze   B: back", 6, d.height() - 12);
}

bool CameraApp::onInput(const InputReport& r) {
    if (r.event == InputEvent::SelectPress) {
        frozen_ = !frozen_;
        return true;
    }
    return false;   // B falls through to the kernel
}

}  // namespace byte_os
