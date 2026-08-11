/*!
 * DFRobot vendor LVGL/Canvas path — CONTINUOUS LOOP.
 *
 * Same calls as DFRobot's official Rectangle.ino example, but repeating
 * forever so there is no moment to miss. If the vendor's own API cannot
 * paint this panel, the fault is below our application layer.
 *
 * Each cycle (~7s): full-screen RED -> GREEN -> BLUE via setScreenBackground,
 * then a white screen with a red rectangle (the literal vendor example).
 */
#include "unihiker_k10.h"

UNIHIKER_K10 k10;
uint8_t      screen_dir = 2;
uint32_t     cycle = 0;

static void bg(uint32_t color, const char* name, uint32_t ms) {
    Serial.printf("        bg %s (0x%06X)\n", name, (unsigned)color);
    Serial.flush();
    k10.setScreenBackground(color);
    k10.canvas->updateCanvas();
    delay(ms);
}

void setup() {
    Serial.begin(115200);
    delay(400);
    Serial.println();
    Serial.println("======================================");
    Serial.println(" VENDOR LVGL/CANVAS PATH - LOOPING");
    Serial.println("======================================");
    Serial.flush();

    Serial.println("[INIT] k10.begin()");        Serial.flush();
    k10.begin();
    Serial.println("[INIT] k10.initScreen()");   Serial.flush();
    k10.initScreen(screen_dir);
    Serial.println("[INIT] k10.creatCanvas()");  Serial.flush();
    k10.creatCanvas();
    Serial.println("[INIT] ready - entering loop"); Serial.flush();
}

void loop() {
    ++cycle;
    Serial.printf("\n=== VENDOR CYCLE %lu ===\n", (unsigned long)cycle);
    Serial.flush();

    bg(0xFF0000, "RED",   1800);
    bg(0x00FF00, "GREEN", 1800);
    bg(0x0000FF, "BLUE",  1800);

    // The literal vendor example: white background + red rectangle
    Serial.println("        vendor rectangle on white");
    Serial.flush();
    k10.setScreenBackground(0xFFFFFF);
    k10.canvas->canvasRectangle(40, 40, 160, 240, 0xFF0000, 0xFFFFFF, true);
    k10.canvas->canvasText("VENDOR PATH", 1, 0x0000FF);
    k10.canvas->updateCanvas();
    delay(2500);
}
