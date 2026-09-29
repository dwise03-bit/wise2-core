#pragma once

#include "DisplayManager.h"
#include "../hardware/K10Pins.h"

class UNIHIKER_K10;
class Canvas;

namespace byte_os {

/**
 * UNIHIKER K10 display backend.
 *
 * Uses the vendor-owned K10 canvas path. Raw TFT access can paint a few boot
 * frames, but on real hardware it can leave the panel stuck showing a stale
 * frame even while the runtime keeps running.
 *
 * The backlight is NOT a GPIO on this board — it sits on the XL9535 I2C
 * expander and is driven through the SDK's digital_write(eLCD_BLK, ...).
 * UNIHIKER_K10::begin() leaves it off, so initialize() raises it explicitly.
 */
class DisplayManager_K10 final : public DisplayManager {
public:
    explicit DisplayManager_K10(UNIHIKER_K10& board);
    ~DisplayManager_K10() override;

    Status initialize() override;
    void shutdown() override;

    int16_t width() const override  { return w_; }
    int16_t height() const override { return h_; }
    void setRotation(Rotation r) override;

    void setBrightness(uint8_t level) override;
    uint8_t brightness() const override { return brightness_; }

    void beginFrame() override;
    void present() override;

    void clear(Color c) override;
    void drawPixel(int16_t x, int16_t y, Color c) override;
    void fillRect(int16_t x, int16_t y, int16_t w, int16_t h, Color c) override;
    void drawRect(int16_t x, int16_t y, int16_t w, int16_t h, Color c) override;
    void fillRoundRect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, Color c) override;
    void drawRoundRect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, Color c) override;
    void fillCircle(int16_t x, int16_t y, int16_t r, Color c) override;
    void drawCircle(int16_t x, int16_t y, int16_t r, Color c) override;
    void fillEllipse(int16_t x, int16_t y, int16_t rx, int16_t ry, Color c) override;
    void drawLine(int16_t x0, int16_t y0, int16_t x1, int16_t y1, Color c) override;
    void drawImage(int16_t x, int16_t y, int16_t w, int16_t h, const uint16_t* data) override;

    void setTextSize(uint8_t size) override;
    void setTextColor(Color fg) override;
    int16_t textWidth(const char* text) const override;
    int16_t fontHeight() const override;
    void drawText(const char* text, int16_t x, int16_t y) override;

    /** Frames actually presented per second, averaged over ~1s. */
    float fps() const { return fps_; }
    /** True if the back buffer lives in PSRAM (expected on K10). */
    bool bufferedInPsram() const { return true; }

private:
    UNIHIKER_K10& board_;
    bool     ready_   = false;
    int16_t  w_       = k10::kScreenWidth;
    int16_t  h_       = k10::kScreenHeight;
    uint8_t  brightness_ = 255;
    uint8_t  textSize_   = 1;
    Color    textColor_  = theme::TextPrimary;
    Color    clearColor_ = theme::Background;

    // FPS accounting
    uint32_t frames_     = 0;
    uint32_t lastFpsMs_  = 0;
    float    fps_        = 0.0f;
};

}  // namespace byte_os
