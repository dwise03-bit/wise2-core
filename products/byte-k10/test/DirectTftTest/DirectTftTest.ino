/*!
 * WISE² BYTE — UNIHIKER K10 direct-TFT bisect (CONTINUOUS LOOP)
 *
 * The LVGL/Canvas path reported success but left the panel showing stale
 * content. This test removes LVGL from the equation entirely:
 *
 *   Phase A  blink the backlight  -> proves XL9535 expander control
 *   Phase B  raw TFT_eSPI fills   -> proves the SPI pixel path
 *
 * The whole sequence REPEATS FOREVER so there is no moment to miss. Each
 * cycle is ~11s and the cycle number is printed to serial.
 *
 * Deliberately does NOT call k10.initScreen() — we do not want LVGL to own
 * the panel here.
 */

#include "unihiker_k10.h"
#include <TFT_eSPI.h>

UNIHIKER_K10 k10;
TFT_eSPI     tft = TFT_eSPI(240, 320);

static uint32_t cycle = 0;

static void fill(uint16_t c, const char* name, uint32_t ms) {
    Serial.printf("        fill %s\n", name);
    Serial.flush();
    tft.fillScreen(c);
    delay(ms);
}

void setup() {
    Serial.begin(115200);
    delay(400);

    Serial.println();
    Serial.println("==========================================");
    Serial.println(" K10 DIRECT-TFT BISECT - CONTINUOUS LOOP");
    Serial.println(" Look at the panel whenever you like.");
    Serial.println(" Each cycle: backlight blink, then R/G/B.");
    Serial.println("==========================================");
    Serial.flush();

    Serial.println("[INIT] k10.begin()...");
    Serial.flush();
    k10.begin();

    Serial.println("[INIT] tft.begin()...");
    Serial.flush();
    digital_write(eLCD_BLK, 1);
    tft.begin();
    tft.setRotation(2);
    Serial.printf("[INIT] tft %dx%d - entering loop\n", tft.width(), tft.height());
    Serial.flush();
}

void loop() {
    ++cycle;
    Serial.printf("\n=== CYCLE %lu ===\n", (unsigned long)cycle);
    Serial.flush();

    // ---- Phase A: backlight blink (expander control) --------------------
    Serial.println("[A] backlight blink x2");
    Serial.flush();
    for (int i = 0; i < 2; ++i) {
        digital_write(eLCD_BLK, 0);
        delay(500);
        digital_write(eLCD_BLK, 1);
        delay(500);
    }

    // ---- Phase B: raw SPI pixel path ------------------------------------
    Serial.println("[B] colour fills");
    Serial.flush();
    fill(TFT_RED,   "RED",   1600);
    fill(TFT_GREEN, "GREEN", 1600);
    fill(TFT_BLUE,  "BLUE",  1600);

    fill(TFT_BLACK, "BLACK", 200);
    tft.setTextColor(TFT_CYAN, TFT_BLACK);
    tft.setTextSize(3);
    tft.setCursor(20, 110);
    tft.println("BYTE OK");
    tft.setTextSize(1);
    tft.setCursor(20, 150);
    tft.printf("cycle %lu", (unsigned long)cycle);
    tft.setCursor(20, 170);
    tft.println("direct TFT_eSPI");
    delay(2500);
}
