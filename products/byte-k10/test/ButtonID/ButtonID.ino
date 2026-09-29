/*!
 * WISE² BYTE — K10 BUTTON IDENTIFICATION
 *
 * Board identification has been unreliable by eye. This removes the guessing:
 * pressing a button produces SERIAL OUTPUT that the developer can see
 * directly, proving which physical board is the K10.
 *
 *   Button A -> screen GREEN, LEDs green, serial "[BUTTON A]"
 *   Button B -> screen BLUE,  LEDs blue,  serial "[BUTTON B]"
 *
 * Idle screen is a solid MAGENTA field with big text — a colour nothing else
 * on the desk is showing.
 */

#include "unihiker_k10.h"
#include <TFT_eSPI.h>

UNIHIKER_K10 k10;
TFT_eSPI     tft = TFT_eSPI(240, 320);

static uint32_t presses = 0;
static bool     prevA = false, prevB = false;

static void idleScreen() {
    tft.fillScreen(TFT_MAGENTA);
    tft.setTextColor(TFT_WHITE, TFT_MAGENTA);
    tft.setTextSize(3);
    tft.setCursor(15, 90);
    tft.println("PRESS A");
    tft.setTextSize(2);
    tft.setCursor(15, 140);
    tft.println("THIS IS THE");
    tft.setCursor(15, 165);
    tft.println("K10 SCREEN");
    tft.setTextSize(1);
    tft.setCursor(15, 200);
    tft.printf("presses: %lu", (unsigned long)presses);
}

void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println();
    Serial.println("=====================================");
    Serial.println(" K10 BUTTON IDENTIFICATION");
    Serial.println(" Press button A or B on the board.");
    Serial.println(" A press here PROVES it is the K10.");
    Serial.println("=====================================");
    Serial.flush();

    k10.begin();
    digital_write(eLCD_BLK, 1);
    tft.begin();
    tft.setRotation(2);

    k10.rgb->setRangeColor(0, 2, 0xFF00FF);   // magenta idle, matches screen
    idleScreen();

    Serial.println("[READY] waiting for button press...");
    Serial.flush();
}

void loop() {
    bool a = k10.buttonA->isPressed();
    bool b = k10.buttonB->isPressed();

    if (a && !prevA) {
        ++presses;
        Serial.printf("\n*** [BUTTON A] PRESSED  (#%lu) ***\n", (unsigned long)presses);
        Serial.flush();
        k10.rgb->setRangeColor(0, 2, 0x00FF00);
        tft.fillScreen(TFT_GREEN);
        tft.setTextColor(TFT_BLACK, TFT_GREEN);
        tft.setTextSize(4);
        tft.setCursor(40, 130);
        tft.println("A");
        delay(700);
        k10.rgb->setRangeColor(0, 2, 0xFF00FF);
        idleScreen();
    }

    if (b && !prevB) {
        ++presses;
        Serial.printf("\n*** [BUTTON B] PRESSED  (#%lu) ***\n", (unsigned long)presses);
        Serial.flush();
        k10.rgb->setRangeColor(0, 2, 0x0000FF);
        tft.fillScreen(TFT_BLUE);
        tft.setTextColor(TFT_WHITE, TFT_BLUE);
        tft.setTextSize(4);
        tft.setCursor(40, 130);
        tft.println("B");
        delay(700);
        k10.rgb->setRangeColor(0, 2, 0xFF00FF);
        idleScreen();
    }

    prevA = a;
    prevB = b;

    static uint32_t hb = 0;
    if (millis() - hb >= 5000) {
        hb = millis();
        Serial.printf("[waiting] %lus, presses=%lu\n",
                      (unsigned long)(millis() / 1000), (unsigned long)presses);
        Serial.flush();
    }
    delay(20);
}
