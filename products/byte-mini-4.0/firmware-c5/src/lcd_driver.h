#pragma once

#include <stdint.h>
#include <stddef.h>

// ============================================================================
// WISE² BYTE Mini 4.0 - ILI9488 Display Driver (ESP32-C5)
// ============================================================================

// Display specs
#define LCD_WIDTH  320
#define LCD_HEIGHT 480

// GPIO pin configuration (Hosyond wiring)
#define LCD_CS_PIN  9
#define LCD_RST_PIN 5
#define LCD_DC_PIN  3
#define LCD_SCK_PIN 6
#define LCD_MOSI_PIN 7
#define LCD_BL_PIN  10

// SPI configuration
#define LCD_SPI_HOST SPI2_HOST
#define LCD_SPI_FREQ_HZ 1000000   // 1MHz for bring-up/protocol probing

// Color definitions (RGB565)
#define COLOR_BLACK   0x0000
#define COLOR_WHITE   0xFFFF
#define COLOR_RED     0xF800
#define COLOR_GREEN   0x07E0
#define COLOR_BLUE    0x001F
#define COLOR_YELLOW  0xFFE0
#define COLOR_CYAN    0x07FF
#define COLOR_MAGENTA 0xF81F

// ============================================================================
// API
// ============================================================================

void lcd_init(void);
void lcd_fill_color(uint16_t color);
void lcd_set_window(uint16_t xs, uint16_t ys, uint16_t xe, uint16_t ye);
void lcd_write_pixel(uint16_t color);
void lcd_write_pixels(const uint8_t *data, size_t len);
