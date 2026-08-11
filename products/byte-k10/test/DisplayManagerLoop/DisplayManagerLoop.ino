#include "unihiker_k10.h"

#include "/Users/danielwise/Projects/wise2-core/products/byte-k10/src/display/DisplayManager_K10.h"

UNIHIKER_K10 k10;
byte_os::DisplayManager_K10 display;

static uint32_t cycle = 0;

static void frame(byte_os::Color bg, byte_os::Color fg, const char* title, uint32_t holdMs) {
    display.beginFrame();
    display.clear(bg);
    display.setTextColor(fg);
    display.setTextSize(3);
    display.drawText(title, 28, 96);
    display.setTextSize(2);
    char line[32];
    snprintf(line, sizeof(line), "cycle %lu", (unsigned long)cycle);
    display.drawText(line, 28, 150);
    display.setTextSize(1);
    display.drawText("DisplayManager_K10", 28, 184);
    display.present();
    delay(holdMs);
}

void setup() {
    Serial.begin(115200);
    delay(400);

    Serial.println();
    Serial.println("==========================================");
    Serial.println(" BYTE K10 DISPLAYMANAGER LOOP");
    Serial.println(" same sprite/present path as runtime");
    Serial.println("==========================================");
    Serial.flush();

    Serial.println("[INIT] k10.begin()");
    Serial.flush();
    k10.begin();

    Serial.println("[INIT] display.initialize()");
    Serial.flush();
    const byte_os::Status status = display.initialize();
    Serial.printf("[DISPLAY] %s%s%s\n", status.label(),
                  status.detail()[0] ? " - " : "", status.detail());
    Serial.flush();
}

void loop() {
    ++cycle;
    Serial.printf("\n=== DM CYCLE %lu ===\n", (unsigned long)cycle);
    Serial.flush();

    frame(byte_os::theme::Danger,  byte_os::theme::White, "RED",   1600);
    frame(byte_os::theme::Success, byte_os::theme::Black, "GREEN", 1600);
    frame(byte_os::theme::AccentAlt, byte_os::theme::White, "VIOLET", 1600);
    frame(byte_os::theme::Black,   byte_os::theme::Accent, "BYTE OK", 2200);
}
