/*!
 * WISE² BYTE — K10 BLACKOUT TEST
 *
 * Purpose: determine WHICH PHYSICAL SCREEN is being observed.
 *
 * The K10 backlight is on the XL9535 expander and is provably under our
 * control. This sketch holds it OFF for 10s, then ON for 4s, forever.
 *
 *   - If the face VANISHES during the dark phase -> it IS the K10 panel,
 *     and the fault is the SPI pixel path.
 *   - If the face stays visible the whole time   -> it is NOT the K10 panel;
 *     a different device is being observed.
 *
 * Nothing else is touched. No SPI, no LVGL.
 */

#include "unihiker_k10.h"

UNIHIKER_K10 k10;
uint32_t     cycle = 0;

void setup() {
    Serial.begin(115200);
    delay(400);
    Serial.println();
    Serial.println("==================================");
    Serial.println(" K10 BLACKOUT TEST");
    Serial.println(" 10s DARK  /  4s LIT  - repeating");
    Serial.println("==================================");
    Serial.flush();

    k10.begin();
    Serial.println("[INIT] begin() ok - entering loop");
    Serial.flush();
}

void loop() {
    ++cycle;

    Serial.printf("\n[%lu] BACKLIGHT OFF  <-- K10 panel should be DARK for 10s\n",
                  (unsigned long)cycle);
    Serial.flush();
    digital_write(eLCD_BLK, 0);
    for (int i = 10; i > 0; --i) {
        Serial.printf("      dark %ds\n", i);
        Serial.flush();
        delay(1000);
    }

    Serial.printf("[%lu] BACKLIGHT ON   <-- K10 panel lit for 4s\n",
                  (unsigned long)cycle);
    Serial.flush();
    digital_write(eLCD_BLK, 1);
    delay(4000);
}
