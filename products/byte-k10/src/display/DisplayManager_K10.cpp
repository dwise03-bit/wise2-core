#include "DisplayManager_K10.h"

#include <Arduino.h>

#include "unihiker_k10.h"

namespace byte_os {

namespace {

static uint32_t rgb565To888(Color c) {
    const uint8_t r = static_cast<uint8_t>(((c >> 11) & 0x1F) * 255 / 31);
    const uint8_t g = static_cast<uint8_t>(((c >> 5) & 0x3F) * 255 / 63);
    const uint8_t b = static_cast<uint8_t>((c & 0x1F) * 255 / 31);
    return (static_cast<uint32_t>(r) << 16) |
           (static_cast<uint32_t>(g) << 8) |
            static_cast<uint32_t>(b);
}

static Canvas::eFontSize_t fontForSize(uint8_t size) {
    return size >= 2 ? Canvas::eCNAndENFont24 : Canvas::eCNAndENFont16;
}

static int16_t fontHeightForSize(uint8_t size) {
    return size >= 2 ? 24 : 16;
}

static int16_t estimateTextWidth(const char* text, uint8_t size) {
    if (!text) return 0;
    const int16_t perChar = size >= 2 ? 12 : 8;
    return static_cast<int16_t>(strlen(text) * perChar);
}

}  // namespace

DisplayManager_K10::DisplayManager_K10(UNIHIKER_K10& board) : board_(board) {}

DisplayManager_K10::~DisplayManager_K10() { shutdown(); }

Status DisplayManager_K10::initialize() {
    board_.initScreen(2);
    board_.creatCanvas();
    board_.setScreenBackground(rgb565To888(theme::Background));
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasRectangle(0, 0, w_, h_,
                                   rgb565To888(theme::Background),
                                   rgb565To888(theme::Background), true);
    board_.canvas->updateCanvas();

    ready_ = true;
    lastFpsMs_ = millis();
    return Status::pass("vendor canvas mode");
}

void DisplayManager_K10::shutdown() {
    ready_ = false;
}

void DisplayManager_K10::setRotation(Rotation r) {
    // The vendor canvas is initialized once in portrait for demo stability.
    (void)r;
}

void DisplayManager_K10::setBrightness(uint8_t level) {
    brightness_ = level;
    digital_write(eLCD_BLK, level > 0 ? 1 : 0);
}

void DisplayManager_K10::beginFrame() {}

void DisplayManager_K10::present() {
    if (!ready_) return;

    board_.canvas->updateCanvas();

    ++frames_;
    const uint32_t now = millis();
    const uint32_t dt = now - lastFpsMs_;
    if (dt >= 1000) {
        fps_ = (frames_ * 1000.0f) / static_cast<float>(dt);
        frames_ = 0;
        lastFpsMs_ = now;
    }
}

void DisplayManager_K10::clear(Color c) {
    clearColor_ = c;
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasRectangle(0, 0, w_, h_, rgb565To888(c), rgb565To888(c), true);
}

void DisplayManager_K10::drawPixel(int16_t x, int16_t y, Color c) {
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasPoint(x, y, rgb565To888(c));
}

void DisplayManager_K10::fillRect(int16_t x, int16_t y, int16_t w, int16_t h, Color c) {
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasRectangle(x, y, w, h, rgb565To888(c), rgb565To888(c), true);
}

void DisplayManager_K10::drawRect(int16_t x, int16_t y, int16_t w, int16_t h, Color c) {
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasRectangle(x, y, w, h, rgb565To888(c), rgb565To888(clearColor_), false);
}

void DisplayManager_K10::fillRoundRect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, Color c) {
    fillRect(x + r, y, w - r * 2, h, c);
    fillRect(x, y + r, r, h - r * 2, c);
    fillRect(x + w - r, y + r, r, h - r * 2, c);
    fillCircle(x + r, y + r, r, c);
    fillCircle(x + w - r - 1, y + r, r, c);
    fillCircle(x + r, y + h - r - 1, r, c);
    fillCircle(x + w - r - 1, y + h - r - 1, r, c);
}

void DisplayManager_K10::drawRoundRect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, Color c) {
    drawLine(x + r, y, x + w - r - 1, y, c);
    drawLine(x + r, y + h - 1, x + w - r - 1, y + h - 1, c);
    drawLine(x, y + r, x, y + h - r - 1, c);
    drawLine(x + w - 1, y + r, x + w - 1, y + h - r - 1, c);
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasCircle(x + r, y + r, r, rgb565To888(c), rgb565To888(clearColor_), false);
    board_.canvas->canvasCircle(x + w - r - 1, y + r, r, rgb565To888(c), rgb565To888(clearColor_), false);
    board_.canvas->canvasCircle(x + r, y + h - r - 1, r, rgb565To888(c), rgb565To888(clearColor_), false);
    board_.canvas->canvasCircle(x + w - r - 1, y + h - r - 1, r, rgb565To888(c), rgb565To888(clearColor_), false);
}

void DisplayManager_K10::fillCircle(int16_t x, int16_t y, int16_t r, Color c) {
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasCircle(x, y, r, rgb565To888(c), rgb565To888(c), true);
}

void DisplayManager_K10::drawCircle(int16_t x, int16_t y, int16_t r, Color c) {
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasCircle(x, y, r, rgb565To888(c), rgb565To888(clearColor_), false);
}

void DisplayManager_K10::fillEllipse(int16_t x, int16_t y, int16_t rx, int16_t ry, Color c) {
    for (int16_t dy = -ry; dy <= ry; ++dy) {
        const float norm = 1.0f - (static_cast<float>(dy * dy) / static_cast<float>(ry * ry));
        const int16_t span = norm <= 0.0f ? 0 : static_cast<int16_t>(rx * sqrtf(norm));
        drawLine(x - span, y + dy, x + span, y + dy, c);
    }
}

void DisplayManager_K10::drawLine(int16_t x0, int16_t y0, int16_t x1, int16_t y1, Color c) {
    board_.canvas->canvasSetLineWidth(1);
    board_.canvas->canvasLine(x0, y0, x1, y1, rgb565To888(c));
}

void DisplayManager_K10::drawImage(int16_t x, int16_t y, int16_t w, int16_t h, const uint16_t* data) {
    board_.canvas->canvasDrawBitmap(x, y, w, h, reinterpret_cast<const uint8_t*>(data));
}

void DisplayManager_K10::setTextSize(uint8_t size) {
    textSize_ = size == 0 ? 1 : size;
}

void DisplayManager_K10::setTextColor(Color fg) {
    textColor_ = fg;
}

int16_t DisplayManager_K10::textWidth(const char* text) const {
    return estimateTextWidth(text, textSize_);
}

int16_t DisplayManager_K10::fontHeight() const {
    return fontHeightForSize(textSize_);
}

void DisplayManager_K10::drawText(const char* text, int16_t x, int16_t y) {
    board_.canvas->canvasText(text, x, y, rgb565To888(textColor_), fontForSize(textSize_), 60, false);
}

}  // namespace byte_os
