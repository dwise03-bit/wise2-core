#include "DisplayManager.h"

#include <stdio.h>

namespace byte_os {

void DisplayManager::drawTextAligned(const char* text, Rect box, TextAlign align,
                                     Color c, uint8_t size) {
    setTextSize(size);
    setTextColor(c);
    const int16_t tw = textWidth(text);
    const int16_t th = fontHeight();
    int16_t x = box.x;
    switch (align) {
        case TextAlign::Center: x = box.x + (box.w - tw) / 2; break;
        case TextAlign::Right:  x = box.x + box.w - tw;       break;
        case TextAlign::Left:   break;
    }
    drawText(text, x, box.y + (box.h - th) / 2);
}

void DisplayManager::drawCard(Rect box, Color fill) {
    fillRoundRect(box.x, box.y, box.w, box.h, 8, fill);
}

void DisplayManager::drawBattery(int16_t x, int16_t y, uint8_t percent, bool charging) {
    constexpr int16_t bw = 22, bh = 11;
    const Color body = (percent <= 15 && !charging) ? theme::Danger : theme::Chrome;

    drawRoundRect(x, y, bw, bh, 2, body);
    fillRect(x + bw, y + 3, 2, bh - 6, body);   // terminal nub

    if (percent > 100) percent = 100;
    const int16_t fillW = static_cast<int16_t>((bw - 4) * percent / 100);
    if (fillW > 0) {
        Color c = theme::Success;
        if (percent <= 15) c = theme::Danger;
        else if (percent <= 35) c = theme::Warning;
        fillRect(x + 2, y + 2, fillW, bh - 4, c);
    }

    if (charging) {
        // Small bolt: two triangles approximated with lines.
        const int16_t cx = x + bw / 2, cy = y + bh / 2;
        drawLine(cx + 1, y + 1, cx - 2, cy, theme::Background);
        drawLine(cx - 2, cy, cx + 1, cy, theme::Background);
        drawLine(cx + 1, cy, cx - 1, y + bh - 1, theme::Background);
    }
}

void DisplayManager::drawWiFi(int16_t x, int16_t y, int8_t rssi, bool connected) {
    // Three arcs approximated by stacked bars: simple, legible at this size.
    const int16_t barW = 3, gap = 2;
    int8_t bars = 0;
    if (connected) {
        if (rssi >= -55)      bars = 3;
        else if (rssi >= -70) bars = 2;
        else                  bars = 1;
    }
    for (int8_t i = 0; i < 3; ++i) {
        const int16_t h = 4 + i * 3;
        const Color c = (i < bars) ? theme::ChromeBright : theme::SurfaceAlt;
        fillRect(x + i * (barW + gap), y + (10 - h), barW, h, c);
    }
}

void DisplayManager::drawBluetooth(int16_t x, int16_t y, bool connected) {
    const Color c = connected ? theme::Accent : theme::SurfaceAlt;
    const int16_t cx = x + 4, top = y, bot = y + 10, mid = y + 5;
    drawLine(cx, top, cx, bot, c);
    drawLine(cx, top, cx + 4, mid - 2, c);
    drawLine(cx + 4, mid - 2, cx - 3, mid + 2, c);
    drawLine(cx, bot, cx + 4, mid + 2, c);
    drawLine(cx + 4, mid + 2, cx - 3, mid - 2, c);
}

void DisplayManager::drawStatusBar(const char* title, uint8_t batteryPercent, bool charging,
                                   int8_t wifiRssi, bool wifiConnected, bool btConnected) {
    const int16_t W = width();
    fillRect(0, 0, W, kStatusBarHeight, theme::Surface);
    fillRect(0, kStatusBarHeight - 1, W, 1, theme::SurfaceAlt);

    setTextSize(1);
    setTextColor(theme::TextPrimary);
    drawText(title, 6, 7);

    int16_t x = W - 28;
    if (batteryPercent == 255) {
        setTextColor(theme::TextMuted);
        drawText("n/a", x - 2, 7);
    } else {
        drawBattery(x, 6, batteryPercent, charging);
    }
    x -= 18;
    drawWiFi(x, 6, wifiRssi, wifiConnected);
    x -= 14;
    drawBluetooth(x, 6, btConnected);
}

void DisplayManager::drawPopup(const char* title, const char* message) {
    const int16_t W = width(), H = height();
    const int16_t pw = W - 40;
    const int16_t ph = 96;
    const int16_t px = 20, py = (H - ph) / 2;

    // Dim the field behind the popup with a cheap 50% stipple.
    for (int16_t yy = 0; yy < H; yy += 2)
        for (int16_t xx = 0; xx < W; xx += 2)
            drawPixel(xx, yy, theme::Background);

    fillRoundRect(px, py, pw, ph, 10, theme::Surface);
    drawRoundRect(px, py, pw, ph, 10, theme::Accent);

    drawTextAligned(title, Rect{px, static_cast<int16_t>(py + 12), pw, 18},
                    TextAlign::Center, theme::Accent, 2);
    drawTextAligned(message, Rect{px, static_cast<int16_t>(py + 46), pw, 16},
                    TextAlign::Center, theme::TextPrimary, 1);
}

}  // namespace byte_os
