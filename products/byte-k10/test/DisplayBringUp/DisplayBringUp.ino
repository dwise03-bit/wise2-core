/*!
 * WISE² BYTE MINI 4.0 — UNIHIKER K10 Display Bring-Up
 *
 * PURPOSE: prove the physical 240x320 ILI9341 renders real colour before any
 * UI, HAL, or application code is written. This is a hard gate.
 *
 * Uses the official UNIHIKER_K10 board API rather than raw TFT_eSPI, because
 * the LCD backlight is behind the XL9535 I2C expander (eLCD_BLK) — driving
 * SPI alone leaves the panel dark.
 *
 * Expected on screen:  RED -> GREEN -> BLUE -> WHITE -> BLACK + text
 */

#include "unihiker_k10.h"

UNIHIKER_K10 k10;

static const uint8_t  kScreenDir = 2;
static const int16_t  kW = 240;
static const int16_t  kH = 320;

static void fillScreen(uint32_t rgb, const char* name, uint32_t holdMs) {
    Serial.printf("[TEST] %s (0x%06X)\n", name, (unsigned)rgb);
    Serial.flush();
    k10.canvas->canvasRectangle(0, 0, kW, kH, rgb, rgb, true);
    k10.canvas->updateCanvas();
    delay(holdMs);
}

void setup() {
    Serial.begin(115200);
    delay(300);

    Serial.println();
    Serial.println("==========================================");
    Serial.println(" WISE2 BYTE - UNIHIKER K10 DISPLAY BRINGUP");
    Serial.println("==========================================");
    Serial.println(" Panel   : ILI9341 240x320 (no touch)");
    Serial.println(" MOSI=21 SCLK=12 CS=14 DC=13 RST=-1");
    Serial.println(" Backlight: XL9535 expander (eLCD_BLK)");
    Serial.println("==========================================");
    Serial.flush();

    Serial.println("[LCD] k10.begin() - board power + expander...");
    Serial.flush();
    k10.begin();
    Serial.println("[LCD] begin() returned");

    Serial.printf("[LCD] initScreen(dir=%u)...\n", kScreenDir);
    Serial.flush();
    k10.initScreen(kScreenDir);
    Serial.println("[LCD] initScreen() returned");

    Serial.println("[LCD] creatCanvas()...");
    Serial.flush();
    k10.creatCanvas();
    Serial.println("[LCD] canvas ready");
    Serial.flush();

    Serial.println();
    Serial.println("[TEST] --- colour sequence begins ---");
    Serial.flush();

    fillScreen(0xFF0000, "RED",   2000);
    fillScreen(0x00FF00, "GREEN", 2000);
    fillScreen(0x0000FF, "BLUE",  2000);
    fillScreen(0xFFFFFF, "WHITE", 1500);
    fillScreen(0x000000, "BLACK", 500);

    Serial.println("[TEST] Drawing text...");
    Serial.flush();
    k10.canvas->canvasText("BYTE DISPLAY OK", 2, 0x2E9BFF);
    k10.canvas->canvasText("WISE2 / UNIHIKER K10", 4, 0xFFFFFF);
    k10.canvas->updateCanvas();

    Serial.println("[TEST] --- sequence complete ---");
    Serial.println();
    Serial.println("RESULT: if you saw RED GREEN BLUE WHITE then BLACK with");
    Serial.println("        blue text, the panel is fully operational.");
    Serial.flush();
}

void loop() {
    // Heartbeat so we can tell the firmware is alive, not hung.
    static uint32_t last = 0;
    if (millis() - last >= 5000) {
        last = millis();
        Serial.printf("[ALIVE] uptime %lus  freeheap %u\n",
                      (unsigned long)(millis() / 1000),
                      (unsigned)ESP.getFreeHeap());
    }
    delay(50);
}
