#include "lcd_driver.h"
#include <driver/spi_master.h>
#include <driver/gpio.h>
#include <esp_log.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <string.h>

static const char *TAG = "LCD";
static spi_device_handle_t spi_handle = NULL;

// ============================================================================
// Low-level SPI operations
// ============================================================================

static void spi_write_byte(uint8_t byte) {
    spi_transaction_t t = {};
    t.length = 8;
    t.tx_buffer = &byte;
    spi_device_transmit(spi_handle, &t);
}

static void lcd_write_command(uint8_t cmd) {
    gpio_set_level((gpio_num_t)LCD_DC_PIN, 0);
    spi_write_byte(cmd);
}

static void lcd_write_data(uint8_t data) {
    gpio_set_level((gpio_num_t)LCD_DC_PIN, 1);
    spi_write_byte(data);
}

static void lcd_write_data_multi(const uint8_t *data, size_t len) {
    gpio_set_level((gpio_num_t)LCD_DC_PIN, 1);
    for (size_t i = 0; i < len; i++) {
        spi_write_byte(data[i]);
    }
}

// ============================================================================
// Hardware reset and initialization
// ============================================================================

static void lcd_hardware_reset(void) {
    ESP_LOGI(TAG, "Hardware reset");
    gpio_set_level((gpio_num_t)LCD_RST_PIN, 1);
    vTaskDelay(20 / portTICK_PERIOD_MS);
    gpio_set_level((gpio_num_t)LCD_RST_PIN, 0);
    vTaskDelay(20 / portTICK_PERIOD_MS);
    gpio_set_level((gpio_num_t)LCD_RST_PIN, 1);
    vTaskDelay(150 / portTICK_PERIOD_MS);
}

static void lcd_software_reset(void) {
    ESP_LOGI(TAG, "Software reset");
    lcd_write_command(0x01);
    vTaskDelay(150 / portTICK_PERIOD_MS);
}

static void lcd_init_spi(void) {
    ESP_LOGI(TAG, "Initializing SPI at 80MHz");

    spi_bus_config_t buscfg = {};
    buscfg.mosi_io_num = LCD_MOSI_PIN;
    buscfg.sclk_io_num = LCD_SCK_PIN;
    buscfg.miso_io_num = -1;
    buscfg.quadwp_io_num = -1;
    buscfg.quadhd_io_num = -1;
    buscfg.max_transfer_sz = 1000000;

    spi_device_interface_config_t devcfg = {};
    devcfg.clock_speed_hz = LCD_SPI_FREQ_HZ;
    devcfg.mode = 3;  // Try mode 3 (CPOL=1, CPHA=1)
    devcfg.spics_io_num = LCD_CS_PIN;
    devcfg.queue_size = 7;

    ESP_ERROR_CHECK(spi_bus_initialize(LCD_SPI_HOST, &buscfg, SPI_DMA_CH_AUTO));
    ESP_ERROR_CHECK(spi_bus_add_device(LCD_SPI_HOST, &devcfg, &spi_handle));
}

static void lcd_init_gpio(void) {
    ESP_LOGI(TAG, "Initializing GPIO");

    gpio_config_t io_conf = {};
    io_conf.pin_bit_mask = (1ULL << LCD_DC_PIN) | (1ULL << LCD_RST_PIN) | (1ULL << LCD_BL_PIN);
    io_conf.mode = GPIO_MODE_OUTPUT;
    io_conf.pull_up_en = GPIO_PULLUP_DISABLE;
    io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE;
    io_conf.intr_type = GPIO_INTR_DISABLE;

    gpio_config(&io_conf);
    gpio_set_level((gpio_num_t)LCD_BL_PIN, 1);
}

// ============================================================================
// ILI9488 Initialization (from TFT_eSPI profile)
// ============================================================================

void lcd_init(void) {
    ESP_LOGI(TAG, "=== LCD Init (ILI9488) ===");

    lcd_init_gpio();
    lcd_init_spi();
    lcd_hardware_reset();
    lcd_software_reset();

    // Exit sleep mode
    lcd_write_command(0x11);
    vTaskDelay(120 / portTICK_PERIOD_MS);

    // Power control A (0xCB)
    lcd_write_command(0xCB);
    lcd_write_data(0x39);
    lcd_write_data(0x2C);
    lcd_write_data(0x00);
    lcd_write_data(0x34);
    lcd_write_data(0x02);

    // Power control B (0xCF)
    lcd_write_command(0xCF);
    lcd_write_data(0x00);
    lcd_write_data(0xC1);
    lcd_write_data(0x30);

    // Driver timing control A (0xE8)
    lcd_write_command(0xE8);
    lcd_write_data(0x85);
    lcd_write_data(0x00);
    lcd_write_data(0x78);

    // Driver timing control B (0xEA)
    lcd_write_command(0xEA);
    lcd_write_data(0x00);
    lcd_write_data(0x00);

    // Power on sequence control (0xED)
    lcd_write_command(0xED);
    lcd_write_data(0x64);
    lcd_write_data(0x03);
    lcd_write_data(0x12);
    lcd_write_data(0x81);

    // VCOM control (0xBB)
    lcd_write_command(0xBB);
    lcd_write_data(0x28);

    // VCOM control 2 (0xBC)
    lcd_write_command(0xBC);
    lcd_write_data(0xD0);

    // Enable 3G (0xF2)
    lcd_write_command(0xF2);
    lcd_write_data(0x00);

    // Gamma correction (0x26)
    lcd_write_command(0x26);
    lcd_write_data(0x01);

    // Positive gamma correction (0xE0)
    lcd_write_command(0xE0);
    uint8_t pgc[] = {0x0F, 0x31, 0x2B, 0x0C, 0x0E, 0x08, 0x4E, 0xF1,
                     0x37, 0x07, 0x10, 0x03, 0x0E, 0x09, 0x00};
    lcd_write_data_multi(pgc, sizeof(pgc));

    // Negative gamma correction (0xE1)
    lcd_write_command(0xE1);
    uint8_t ngc[] = {0x00, 0x0E, 0x14, 0x03, 0x11, 0x07, 0x31, 0xC1,
                     0x48, 0x08, 0x0F, 0x0C, 0x31, 0x36, 0x0F};
    lcd_write_data_multi(ngc, sizeof(ngc));

    // Memory access control (0x36)
    lcd_write_command(0x36);
    lcd_write_data(0x08);  // Try different MADCTL (test mode)

    // Pixel format (0x3A)
    lcd_write_command(0x3A);
    lcd_write_data(0x55);  // 16-bit RGB565

    // Frame rate (0xB1)
    lcd_write_command(0xB1);
    lcd_write_data(0x00);
    lcd_write_data(0x18);

    // Display function control (0xB6)
    lcd_write_command(0xB6);
    lcd_write_data(0x08);
    lcd_write_data(0x82);
    lcd_write_data(0x27);

    // Entry mode set (0xB7)
    lcd_write_command(0xB7);
    lcd_write_data(0xC6);

    // Invert display (0x20) - disable
    // (commented out - don't invert)

    // Display on (0x29)
    lcd_write_command(0x29);
    vTaskDelay(100 / portTICK_PERIOD_MS);

    ESP_LOGI(TAG, "=== LCD Init Complete ===");
}

// ============================================================================
// Drawing operations
// ============================================================================

void lcd_set_window(uint16_t xs, uint16_t ys, uint16_t xe, uint16_t ye) {
    // Column address set (0x2A)
    lcd_write_command(0x2A);
    lcd_write_data((xs >> 8) & 0xFF);
    lcd_write_data(xs & 0xFF);
    lcd_write_data((xe >> 8) & 0xFF);
    lcd_write_data(xe & 0xFF);

    // Row address set (0x2B)
    lcd_write_command(0x2B);
    lcd_write_data((ys >> 8) & 0xFF);
    lcd_write_data(ys & 0xFF);
    lcd_write_data((ye >> 8) & 0xFF);
    lcd_write_data(ye & 0xFF);
}

void lcd_fill_color(uint16_t color) {
    lcd_set_window(0, 0, LCD_WIDTH - 1, LCD_HEIGHT - 1);

    // Memory write (0x2C)
    lcd_write_command(0x2C);
    gpio_set_level((gpio_num_t)LCD_DC_PIN, 1);

    uint8_t hi = (color >> 8) & 0xFF;
    uint8_t lo = color & 0xFF;

    for (size_t i = 0; i < (size_t)LCD_WIDTH * LCD_HEIGHT; i++) {
        spi_write_byte(hi);
        spi_write_byte(lo);
    }
}

void lcd_write_pixel(uint16_t color) {
    uint8_t hi = (color >> 8) & 0xFF;
    uint8_t lo = color & 0xFF;
    spi_write_byte(hi);
    spi_write_byte(lo);
}

void lcd_write_pixels(const uint8_t *data, size_t len) {
    gpio_set_level((gpio_num_t)LCD_DC_PIN, 1);
    lcd_write_data_multi(data, len);
}
