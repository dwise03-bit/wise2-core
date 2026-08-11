// ============================================================================
// TFT_eSPI Setup for WISE² BYTE Mini 4.0 on ESP32-S3
// Hosyond 4.0" ILI9488 Display with FT6336U Touchscreen
// ============================================================================

#ifndef USER_SETUP_LOADED
#define USER_SETUP_LOADED

// ============================================================================
// DISPLAY (Hosyond ILI9488 320x480)
// ============================================================================
#define ILI9488_DRIVER

// ============================================================================
// GPIO PIN CONFIGURATION (ESP32-S3)
// ============================================================================
#define TFT_CS          9    // Chip Select
#define TFT_DC          3    // Data/Command
#define TFT_RST         5    // Reset
#define TFT_BL         10    // Backlight

// SPI pins (use hardware defaults for fastest speed on S3)
#define TFT_MOSI        7    // MOSI (GPIO7 on S3)
#define TFT_SCLK        6    // SCK (GPIO6 on S3)
#define TFT_MISO       -1    // Not used (display write-only)

// ============================================================================
// DISPLAY CONFIGURATION
// ============================================================================
#define TFT_WIDTH      320
#define TFT_HEIGHT     480

// Rotation: 0=Portrait, 1=Landscape, 2=Portrait inverted, 3=Landscape inverted
#define TFT_ROTATION   1  // Landscape

// ============================================================================
// SPI CONFIGURATION
// ============================================================================
#define SPI_FREQUENCY  80000000  // 80MHz (ESP32-S3 can handle it)
#define SPI_READ_FREQUENCY 20000000

// Use hardware SPI (fastest)
#define USE_HSPI_PORT

// ============================================================================
// TOUCHSCREEN (FT6336U via I2C)
// ============================================================================
// Touch support via I2C (address 0x38)
#define TOUCH_CS      -1   // Not used (I2C touchscreen)

// I2C pins (default for ESP32-S3)
#define TOUCH_SDA     21   // I2C SDA
#define TOUCH_SCL     22   // I2C SCL

// ============================================================================
// FONT OPTIONS
// ============================================================================
#define LOAD_GLCD      // Font 1
#define LOAD_FONT2     // Font 2
#define LOAD_FONT4     // Font 4
#define LOAD_FONT6     // Font 6
#define LOAD_FONT7     // Font 7
#define LOAD_FONT8     // Font 8
#define LOAD_GFXFF     // FreeFonts

#define SMOOTH_FONT

#endif // USER_SETUP_LOADED
