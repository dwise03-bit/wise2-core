/*!
 * WISE² BYTE — K10 FRESH START
 *
 * Flashed onto a fully erased chip. Proves the board is alive via TWO
 * independent channels, so a dead panel cannot hide a working board:
 *
 *   1. RGB LEDs (WS2812 x3 on GPIO46) — completely independent of the LCD.
 *      Use these to physically identify WHICH board is the K10.
 *   2. LCD (ILI9341 via direct TFT_eSPI) — colour fills + a counter.
 *
 * Both run continuously, in lockstep, forever. The LED colour always
 * matches the screen colour, so they corroborate each other.
 */

#include "unihiker_k10.h"
#include <TFT_eSPI.h>

UNIHIKER_K10 k10;
TFT_eSPI     tft = TFT_eSPI(240, 320);

static uint32_t cycle = 0;

// Show the same colour on the LEDs and the panel at the same moment.
static void both(uint32_t led, uint16_t px, const char* name, uint32_t ms) {
    Serial.printf("      %-6s  LED=0x%06X\n", name, (unsigned)led);
    Serial.flush();
    k10.rgb->setRangeColor(0, 2, led);
    tft.fillScreen(px);
    delay(ms);
}

void setup() {
    Serial.begin(115200);
    delay(500);

    Serial.println();
    Serial.println("=========================================");
    Serial.println(" WISE2 BYTE - K10 FRESH START");
    Serial.println(" Chip erased. Clean flash.");
    Serial.println(" LEDs + screen show the SAME colour.");
    Serial.println("=========================================");
    Serial.flush();

    Serial.println("[INIT] k10.begin()...");
    Serial.flush();
    k10.begin();
    Serial.println("[INIT] begin() ok");

    // LED identity burst BEFORE touching the display, so a dead panel
    // cannot mask this. Three fast white flashes = "this is the K10".
    Serial.println("[ID] 3 white LED flashes - WATCH THE BOARDS");
    Serial.flush();
    for (int i = 0; i < 3; ++i) {
        k10.rgb->setRangeColor(0, 2, 0xFFFFFF);
        delay(250);
        k10.rgb->setRangeColor(0, 2, 0x000000);
        delay(250);
    }

    Serial.println("[INIT] backlight on + tft.begin()...");
    Serial.flush();
    digital_write(eLCD_BLK, 1);
    tft.begin();
    tft.setRotation(2);
    Serial.printf("[INIT] tft %dx%d\n", tft.width(), tft.height());
    Serial.println("[INIT] entering loop");
    Serial.flush();
}

void loop() {
    ++cycle;
    Serial.printf("\n=== CYCLE %lu ===\n", (unsigned long)cycle);
    Serial.flush();

    both(0xFF0000, TFT_RED,   "RED",   1800);
    both(0x00FF00, TFT_GREEN, "GREEN", 1800);
    both(0x0000FF, TFT_BLUE,  "BLUE",  1800);

    // Final frame: dark LEDs, black screen, big counter.
    k10.rgb->setRangeColor(0, 2, 0x000000);
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_CYAN, TFT_BLACK);
    tft.setTextSize(3);
    tft.setCursor(20, 100);
    tft.println("BYTE OK");
    tft.setTextSize(2);
    tft.setCursor(20, 145);
    tft.printf("cycle %lu", (unsigned long)cycle);
    tft.setTextSize(1);
    tft.setCursor(20, 180);
    tft.println("UNIHIKER K10 / WISE2");
    Serial.println("      BLACK + counter");
    Serial.flush();
    delay(2500);
}
