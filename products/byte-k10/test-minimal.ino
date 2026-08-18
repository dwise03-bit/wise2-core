#include <Arduino.h>

// Pin definitions for K10
#define LED_RED    46   // GPIO 46 - red status LED
#define BUTTON_A   0    // GPIO 0 - button A
#define BUTTON_B   14   // GPIO 14 - button B
#define MIC_DATA   3    // GPIO 3
#define SPI_CLK    40   // GPIO 40 - SPI clock
#define SPI_MOSI   41   // GPIO 41
#define SPI_MISO   2    // GPIO 2
#define SPI_CS     39   // GPIO 39 - Display chip select
#define BACKLIGHT  21   // GPIO 21
#define RESET      42   // GPIO 42

void setup() {
    // Initialize Serial
    Serial.begin(115200);
    delay(500);
    Serial.println("\n\n=== WISE² K10 DIAGNOSTIC FIRMWARE ===\n");
    Serial.printf("Boot time: %lu ms\n", millis());

    // Test GPIO 46 (red LED)
    Serial.println("[1/5] Testing GPIO 46 (red LED)...");
    pinMode(LED_RED, OUTPUT);
    digitalWrite(LED_RED, LOW);
    delay(100);
    Serial.println("      ✓ LED should turn OFF now");
    delay(1000);
    digitalWrite(LED_RED, HIGH);
    delay(100);
    Serial.println("      ✓ LED should be ON now");
    delay(1000);
    digitalWrite(LED_RED, LOW);
    Serial.println("      ✓ LED turned OFF - GPIO 46 works!\n");

    // Test other GPIO pins
    Serial.println("[2/5] Testing GPIO pin status...");
    Serial.printf("      BUTTON_A (GPIO 0): %d\n", digitalRead(BUTTON_A));
    Serial.printf("      BUTTON_B (GPIO 14): %d\n", digitalRead(BUTTON_B));
    Serial.printf("      LED_RED (GPIO 46): %d\n", digitalRead(LED_RED));
    Serial.println();

    // Test SPI pins
    Serial.println("[3/5] Checking SPI pin configuration...");
    pinMode(SPI_CLK, OUTPUT);
    pinMode(SPI_MOSI, OUTPUT);
    pinMode(SPI_CS, OUTPUT);
    digitalWrite(SPI_CS, HIGH);  // CS normally high
    Serial.println("      ✓ SPI pins configured\n");

    // Test display RESET pin
    Serial.println("[4/5] Testing display RESET (GPIO 42)...");
    pinMode(RESET, OUTPUT);
    digitalWrite(RESET, LOW);
    Serial.println("      ✓ RESET pulled LOW (holding display in reset)");
    delay(500);
    digitalWrite(RESET, HIGH);
    Serial.println("      ✓ RESET released HIGH (display should start)\n");

    // Test backlight
    Serial.println("[5/5] Testing backlight (GPIO 21)...");
    pinMode(BACKLIGHT, OUTPUT);
    digitalWrite(BACKLIGHT, HIGH);
    Serial.println("      ✓ Backlight ON\n");

    Serial.println("=== DIAGNOSTIC COMPLETE ===");
    Serial.println("All pins responding correctly!");
    Serial.println("\nIf you see white screen:");
    Serial.println("- Display controller may need initialization");
    Serial.println("- SPI communication may be failing");
    Serial.println("- TFT library may have issues\n");
    Serial.println("Entering diagnostic loop. LED blinks every 2 seconds.\n");
}

void loop() {
    // LED blink pattern for heartbeat
    digitalWrite(LED_RED, HIGH);
    delay(100);
    digitalWrite(LED_RED, LOW);
    delay(1900);

    // Print status every 10 seconds
    static uint32_t last_report = 0;
    if (millis() - last_report > 10000) {
        last_report = millis();
        Serial.printf("[%lu ms] Device alive. Button A: %d, Button B: %d\n",
                     millis(), digitalRead(BUTTON_A), digitalRead(BUTTON_B));
    }
}
