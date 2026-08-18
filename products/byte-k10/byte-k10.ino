#include <Arduino.h>
#include "unihiker_k10.h"

UNIHIKER_K10 gBoard;
uint32_t gBootMs = 0;

void setup() {
    gBootMs = millis();
    gBoard.begin();
    delay(120);
    gBoard.initScreen(2);
    gBoard.creatCanvas();
}

void loop() {
    delay(1000);
}
