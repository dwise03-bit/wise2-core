// ============================================================================
// TFT_eSPI Setup for WISE² BYTE Mini 4.0
// Hosyond 4.0" ST7796S Display with FT6336U Touchscreen
// ============================================================================

#ifndef USER_SETUP_LOADED
#define USER_SETUP_LOADED

// ============================================================================
// DISPLAY (Hosyond ST7796S 320x480)
// ============================================================================
#define ST7796S_DRIVER

// ============================================================================
// GPIO PIN CONFIGURATION (ESP32-C5)
// ============================================================================
#define TFT_CS          9    // Chip Select
#define TFT_DC          3    // Data/Command
#define TFT_RST         5    // Reset
#define TFT_BL         10    // Backlight

// SPI pins (use hardware defaults for fastest speed)
#define TFT_MOSI        7    // MOSI
#define TFT_SCLK        6    // SCK
#define TFT_MISO       -1    // Not used (display write-only)

// ============================================================================
// DISPLAY CONFIGURATION
// ============================================================================
#define TFT_WIDTH      320
#define TFT_HEIGHT     480

// Invert colors? (0 or 1)
#define TFT_INVERT_ROTATION 0

// ============================================================================
// SPI CONFIGURATION
// ============================================================================
#define SPI_FREQUENCY  80000000  // 80MHz (hardware SPI max on ESP32)
#define SPI_READ_FREQUENCY 20000000  // Read speed (slower)
#define SPI_TOUCH_FREQUENCY 2000000   // Touch I2C speed

// Use hardware SPI (fastest)
#define USE_HSPI_PORT

// ============================================================================
// TOUCHSCREEN (FT6336U)
// ============================================================================
#define TOUCH_CS      -1   // Not used (I2C touchscreen)
#define TOUCH_FREQUENCY 100000  // 100kHz I2C

// I2C pins (default for ESP32)
#define TOUCH_SDA     21   // I2C SDA
#define TOUCH_SCL     22   // I2C SCL

// ============================================================================
// FONT AND DISPLAY OPTIONS
// ============================================================================
#define LOAD_GLCD      // Font 1. Original Adafruit 8 pixel font needs ~1820 bytes in PROGMEM
#define LOAD_FONT2     // Font 2. Small 16 pixel high font, needs ~3534 bytes in PROGMEM
#define LOAD_FONT4     // Font 4. Medium 26 pixel high font, needs ~5848 bytes in PROGMEM
#define LOAD_FONT6     // Font 6. Large 48 pixel font, needs ~2666 bytes in PROGMEM
#define LOAD_FONT7     // Font 7. 7 segment 48 pixel font, needs ~2438 bytes in PROGMEM
#define LOAD_FONT8     // Font 8. Large 75 pixel font needs ~3256 bytes in PROGMEM
#define LOAD_GFXFF     // FreeFonts

// ============================================================================
// SMOOTH FONTS
// ============================================================================
#define SMOOTH_FONT

#endif // USER_SETUP_LOADED
