#include <Arduino.h>
#include <SPI.h>
#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

void setup() {
    Serial.begin(115200);
    delay(500);

    Serial.println("\n\n=== WISE² BYTE Mini 4.0 - ESP32-S3 Display Test ===");
    Serial.println("Initializing TFT_eSPI with ILI9488...");

    // Initialize display
    tft.init();
    tft.setRotation(1);  // Landscape
    tft.fillScreen(TFT_BLACK);

    Serial.print("Display width: ");
    Serial.println(tft.width());
    Serial.print("Display height: ");
    Serial.println(tft.height());
    Serial.println("Ready!\n");

    // Turn on backlight
    pinMode(10, OUTPUT);
    digitalWrite(10, HIGH);
}

void loop() {
    // Color cycle test
    struct {
        uint32_t color;
        const char *name;
    } colors[] = {
        {TFT_RED, "RED"},
        {TFT_GREEN, "GREEN"},
        {TFT_BLUE, "BLUE"},
        {TFT_YELLOW, "YELLOW"},
        {TFT_CYAN, "CYAN"},
        {TFT_MAGENTA, "MAGENTA"},
        {TFT_WHITE, "WHITE"},
        {TFT_BLACK, "BLACK"},
    };

    for (int i = 0; i < 8; i++) {
        Serial.printf("→ %s\n", colors[i].name);
        tft.fillScreen(colors[i].color);
        delay(2000);
    }
}
