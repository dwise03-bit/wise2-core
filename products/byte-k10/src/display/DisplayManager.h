#pragma once

#include <stdint.h>

#include "../core/Status.h"

namespace byte_os {

/** 16-bit RGB565 colour, the native pixel format of the ILI9341. */
using Color = uint16_t;

constexpr Color rgb(uint8_t r, uint8_t g, uint8_t b) {
    return static_cast<Color>(((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3));
}

/**
 * WISE² BYTE palette. Dark charcoal base, chrome accents, electric blue
 * highlights. Defined once here so no application hardcodes a colour.
 */
namespace theme {
constexpr Color Background   = rgb(0x12, 0x14, 0x18);  // deep charcoal
constexpr Color Surface      = rgb(0x1C, 0x20, 0x26);  // raised card
constexpr Color SurfaceAlt   = rgb(0x26, 0x2B, 0x33);  // pressed / alt row
constexpr Color Chrome       = rgb(0x8A, 0x93, 0x9E);  // chrome accent
constexpr Color ChromeBright = rgb(0xC7, 0xCE, 0xD6);  // chrome highlight
constexpr Color Accent       = rgb(0x63, 0xFF, 0x6A);  // WISE² neon green
constexpr Color AccentDim    = rgb(0x17, 0x5F, 0x22);
constexpr Color AccentAlt    = rgb(0x9B, 0x4D, 0xFF);  // PIFF CITY purple
constexpr Color TextPrimary  = rgb(0xF2, 0xF5, 0xF8);
constexpr Color TextMuted    = rgb(0x8A, 0x93, 0x9E);
constexpr Color Success      = rgb(0x35, 0xC7, 0x59);
constexpr Color Warning      = rgb(0xFF, 0xB0, 0x2E);
constexpr Color Danger       = rgb(0xFF, 0x45, 0x3A);
constexpr Color Black        = rgb(0, 0, 0);
constexpr Color White        = rgb(0xFF, 0xFF, 0xFF);
}  // namespace theme

enum class Rotation : uint8_t { Portrait = 0, Landscape = 1, PortraitFlip = 2, LandscapeFlip = 3 };

enum class TextAlign : uint8_t { Left, Center, Right };

struct Rect {
    int16_t x, y, w, h;

    // Explicit constructors: with default member initialisers this type would
    // not be an aggregate under the C++11 the ESP32 core compiles with, so
    // brace-initialisation would be rejected.
    constexpr Rect() : x(0), y(0), w(0), h(0) {}
    constexpr Rect(int16_t x_, int16_t y_, int16_t w_, int16_t h_)
        : x(x_), y(y_), w(w_), h(h_) {}

    constexpr bool contains(int16_t px, int16_t py) const {
        return px >= x && py >= y && px < x + w && py < y + h;
    }
};

/**
 * Hardware abstraction for the panel.
 *
 * Application and UI code never touches the panel driver directly — it holds a
 * DisplayManager reference. Concrete backends (DisplayManager_K10,
 * _CYD, _ESP32C5, _RaspberryPi) implement only the pure-virtual primitives at
 * the top; every widget helper below is implemented once in terms of those, so
 * porting to a new panel means implementing the primitives and nothing else.
 */
class DisplayManager {
public:
    virtual ~DisplayManager() = default;

    DisplayManager(const DisplayManager&) = delete;
    DisplayManager& operator=(const DisplayManager&) = delete;

    // ---- Lifecycle -------------------------------------------------------
    virtual Status initialize() = 0;
    virtual void shutdown() {}

    // ---- Geometry --------------------------------------------------------
    virtual int16_t width() const = 0;
    virtual int16_t height() const = 0;
    virtual void setRotation(Rotation r) = 0;

    // ---- Backlight -------------------------------------------------------
    virtual void setBrightness(uint8_t level) = 0;  // 0-255
    virtual uint8_t brightness() const = 0;

    // ---- Frame control ---------------------------------------------------
    /** Begin a frame. Drawing between begin/present goes to the back buffer. */
    virtual void beginFrame() = 0;
    /** Push the completed frame to the panel. */
    virtual void present() = 0;

    // ---- Primitives (backend must implement) -----------------------------
    virtual void clear(Color c) = 0;
    virtual void drawPixel(int16_t x, int16_t y, Color c) = 0;
    virtual void fillRect(int16_t x, int16_t y, int16_t w, int16_t h, Color c) = 0;
    virtual void drawRect(int16_t x, int16_t y, int16_t w, int16_t h, Color c) = 0;
    virtual void fillRoundRect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, Color c) = 0;
    virtual void drawRoundRect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, Color c) = 0;
    virtual void fillCircle(int16_t x, int16_t y, int16_t r, Color c) = 0;
    virtual void drawCircle(int16_t x, int16_t y, int16_t r, Color c) = 0;
    virtual void fillEllipse(int16_t x, int16_t y, int16_t rx, int16_t ry, Color c) = 0;
    virtual void drawLine(int16_t x0, int16_t y0, int16_t x1, int16_t y1, Color c) = 0;

    /** Draw RGB565 pixel data. `data` is w*h shorts, row-major. */
    virtual void drawImage(int16_t x, int16_t y, int16_t w, int16_t h, const uint16_t* data) = 0;

    // ---- Text ------------------------------------------------------------
    virtual void setTextSize(uint8_t size) = 0;
    virtual void setTextColor(Color fg) = 0;
    virtual int16_t textWidth(const char* text) const = 0;
    virtual int16_t fontHeight() const = 0;
    virtual void drawText(const char* text, int16_t x, int16_t y) = 0;

    /** Convenience: aligned text inside a box. Implemented via drawText. */
    void drawTextAligned(const char* text, Rect box, TextAlign align, Color c, uint8_t size = 1);

    // ---- Composite widgets (implemented on top of the primitives) --------
    void drawStatusBar(const char* title, uint8_t batteryPercent, bool charging,
                       int8_t wifiRssi, bool wifiConnected, bool btConnected);
    void drawBattery(int16_t x, int16_t y, uint8_t percent, bool charging);
    void drawWiFi(int16_t x, int16_t y, int8_t rssi, bool connected);
    void drawBluetooth(int16_t x, int16_t y, bool connected);
    void drawPopup(const char* title, const char* message);
    void drawCard(Rect box, Color fill = theme::Surface);

    /** Height reserved at the top of the screen for the status bar. */
    static constexpr int16_t kStatusBarHeight = 22;

protected:
    DisplayManager() = default;
};

}  // namespace byte_os
