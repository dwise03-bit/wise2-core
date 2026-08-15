/*
 * WISE2 BYTE MINI 4.0 - ESP32-C5 LCD BRING-UP
 *
 * This is a staged bring-up harness for the current repo wiring evidence:
 *  - GPIO diagnostic mode first
 *  - manual ST7796S SPI init with 18-bit color framing
 *  - black/red/green/blue/white fill test
 *  - text, bars, and basic shape/orientation diagnostics
 *  - optional higher clock test ladder once the base fill test is known good
 *
 * The code intentionally avoids touch, SD, audio, Wi-Fi, BLE, LVGL and any
 * higher-level UI framework until the LCD path is proven.
 */

#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#include "driver/gpio.h"
#include "driver/i2c.h"
#include "esp_check.h"
#include "esp_chip_info.h"
#include "esp_err.h"
#include "esp_heap_caps.h"
#include "esp_idf_version.h"
#include "esp_lcd_io_spi.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_ops.h"
#include "esp_log.h"
#include "esp_rom_sys.h"
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static const char *TAG = "BYTE-LCD";

#define FW_VERSION "WISE2 BYTE MINI 4.0 / lcd-bringup st7796s-320x480"

/* LCD wiring established in the repo's C5 diagnostics. */
#define PIN_LCD_CS    9
#define PIN_LCD_DC    3
#define PIN_LCD_SCK   6
#define PIN_LCD_MOSI  7
#define PIN_LCD_MISO  2
#define PIN_LCD_RST   5
#define PIN_LCD_BL   10
/* FT6336U touch wiring. The product setup files point this panel at the ESP32
 * default I2C pair, which maps here to GPIO21/GPIO22. */
#define TOUCH_I2C_ADDR     0x38
#define PIN_CTP_SDA        21
#define PIN_CTP_SCL        22

#define LCD_WIDTH   320
#define LCD_HEIGHT  480
#define LCD_CMD_BITS 8
#define LCD_PARAM_BITS 8

#define HOLD_MS 100

static esp_lcd_panel_handle_t s_panel = NULL;
static esp_lcd_panel_io_handle_t s_io = NULL;
static bool s_touch_ready = false;
static int s_touch_sda = -1;
static int s_touch_scl = -1;
bool g_lcd_use_rgb666 = false;

extern esp_err_t esp_lcd_new_panel_io_spi_local(esp_lcd_spi_bus_handle_t bus,
                                                const esp_lcd_panel_io_spi_config_t *io_config,
                                                esp_lcd_panel_io_handle_t *ret_io);

static void lcd_fill_rect(int x, int y, int w, int h, uint16_t color);

typedef struct {
    char ch;
    uint8_t rows[7];
} glyph_t;

static const glyph_t s_font[] = {
    { ' ', {0x00,0x00,0x00,0x00,0x00,0x00,0x00} },
    { '-', {0x00,0x00,0x00,0x1F,0x00,0x00,0x00} },
    { '0', {0x0E,0x11,0x13,0x15,0x19,0x11,0x0E} },
    { '1', {0x04,0x0C,0x14,0x04,0x04,0x04,0x1F} },
    { '2', {0x0E,0x11,0x01,0x02,0x04,0x08,0x1F} },
    { '3', {0x1E,0x01,0x01,0x0E,0x01,0x01,0x1E} },
    { '4', {0x02,0x06,0x0A,0x12,0x1F,0x02,0x02} },
    { '5', {0x1F,0x10,0x10,0x1E,0x01,0x01,0x1E} },
    { '6', {0x0E,0x10,0x10,0x1E,0x11,0x11,0x0E} },
    { '7', {0x1F,0x01,0x02,0x04,0x08,0x08,0x08} },
    { '8', {0x0E,0x11,0x11,0x0E,0x11,0x11,0x0E} },
    { '9', {0x0E,0x11,0x11,0x0F,0x01,0x01,0x0E} },
    { 'A', {0x0E,0x11,0x11,0x1F,0x11,0x11,0x11} },
    { 'B', {0x1E,0x11,0x11,0x1E,0x11,0x11,0x1E} },
    { 'C', {0x0E,0x11,0x10,0x10,0x10,0x11,0x0E} },
    { 'D', {0x1E,0x11,0x11,0x11,0x11,0x11,0x1E} },
    { 'E', {0x1F,0x10,0x10,0x1E,0x10,0x10,0x1F} },
    { 'I', {0x1F,0x04,0x04,0x04,0x04,0x04,0x1F} },
    { 'L', {0x10,0x10,0x10,0x10,0x10,0x10,0x1F} },
    { 'M', {0x11,0x1B,0x15,0x15,0x11,0x11,0x11} },
    { 'N', {0x11,0x19,0x15,0x13,0x11,0x11,0x11} },
    { 'O', {0x0E,0x11,0x11,0x11,0x11,0x11,0x0E} },
    { 'P', {0x1E,0x11,0x11,0x1E,0x10,0x10,0x10} },
    { 'R', {0x1E,0x11,0x11,0x1E,0x14,0x12,0x11} },
    { 'S', {0x0F,0x10,0x10,0x0E,0x01,0x01,0x1E} },
    { 'T', {0x1F,0x04,0x04,0x04,0x04,0x04,0x04} },
    { 'U', {0x11,0x11,0x11,0x11,0x11,0x11,0x0E} },
    { 'V', {0x11,0x11,0x11,0x11,0x0A,0x0A,0x04} },
    { 'W', {0x11,0x11,0x11,0x15,0x15,0x1B,0x11} },
    { 'X', {0x11,0x11,0x0A,0x04,0x0A,0x11,0x11} },
    { 'Y', {0x11,0x11,0x0A,0x04,0x04,0x04,0x04} },
    { 'Z', {0x1F,0x01,0x02,0x04,0x08,0x10,0x1F} },
    { 'x', {0x11,0x11,0x0A,0x04,0x0A,0x11,0x11} },
};

static const char *const s_color_names[] = {
    "RED",
    "GREEN",
    "BLUE",
    "YELLOW",
    "CYAN",
    "MAGENTA",
    "BLACK",
    "WHITE",
};

static const uint16_t s_color_values[] = {
    0xF800,
    0x07E0,
    0x001F,
    0xFFE0,
    0x07FF,
    0xF81F,
    0x0000,
    0xFFFF,
};

static uint16_t rgb565(uint8_t r, uint8_t g, uint8_t b)
{
    return (uint16_t)(((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3));
}

static void delay_ms(int ms)
{
    if (ms <= 0) {
        return;
    }
    vTaskDelay(pdMS_TO_TICKS(ms));
}

static void log_banner(void)
{
    esp_chip_info_t chip;
    esp_chip_info(&chip);

    printf("\n==================================================\n");
    printf(" %s\n", FW_VERSION);
    printf("==================================================\n");
    printf(" ESP-IDF    : %s\n", esp_get_idf_version());
    printf(" Target     : %s\n", CONFIG_IDF_TARGET);
    printf(" Core count : %d\n", chip.cores);
    printf(" Revision   : v%d.%d\n", chip.revision / 100, chip.revision % 100);
    printf("--------------------------------------------------\n");
    printf(" DISPLAY    : Hosyond 4.0 Inch 320x480 ST7796S\n");
    printf(" LCD native : %dx%d portrait SPI\n", LCD_WIDTH, LCD_HEIGHT);
    printf(" SPI start  : mode 3, 10 MHz ST7796S SPI profile\n");
    printf(" Backlight  : GPIO %d (locked from prior verification)\n", PIN_LCD_BL);
    printf("--------------------------------------------------\n");
    printf(" Repo wiring evidence:\n");
    printf("   LCD_CS   GPIO %d\n", PIN_LCD_CS);
    printf("   LCD_DC   GPIO %d\n", PIN_LCD_DC);
    printf("   LCD_RST  GPIO %d\n", PIN_LCD_RST);
    printf("   LCD_SCK  GPIO %d\n", PIN_LCD_SCK);
    printf("   LCD_MOSI GPIO %d\n", PIN_LCD_MOSI);
    printf("   LCD_MISO  GPIO %d (diagnostic probe)\n", PIN_LCD_MISO);
    printf("   LCD_BL   GPIO %d\n", PIN_LCD_BL);
    printf("   CTP_SDA  GPIO %d (FT6336U I2C SDA)\n", PIN_CTP_SDA);
    printf("   CTP_SCL  GPIO %d (FT6336U I2C SCL)\n", PIN_CTP_SCL);
    printf("   FT6336U  I2C touch on ESP32 default pair\n");
    printf("   SD_CS    not established in repo for this bring-up path\n");
    printf("--------------------------------------------------\n");
    printf(" This build excludes SD, audio, Wi-Fi, BLE,\n");
    printf(" LVGL and the production UI until LCD basic bring-up passes.\n");
    printf("==================================================\n\n");
    fflush(stdout);
}

static void gpio_output_init(int gpio, int level)
{
    gpio_reset_pin((gpio_num_t)gpio);
    gpio_config_t io = {
        .pin_bit_mask = 1ULL << gpio,
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    ESP_ERROR_CHECK(gpio_config(&io));
    ESP_ERROR_CHECK(gpio_set_level((gpio_num_t)gpio, level));
}

static void hold_signal(const char *name, int gpio, int level)
{
    gpio_set_level((gpio_num_t)gpio, level);
    printf("TEST %s %s\n", name, level ? "HIGH" : "LOW");
    fflush(stdout);
    delay_ms(HOLD_MS);
}

static void run_gpio_diagnostic(void)
{
    printf("--------------------------------------------------\n");
    printf("GPIO DIAGNOSTIC MODE\n");
    printf("--------------------------------------------------\n");
    fflush(stdout);

    gpio_output_init(PIN_LCD_BL, 0);
    gpio_output_init(PIN_LCD_CS, 1);
    gpio_output_init(PIN_LCD_DC, 0);
    gpio_output_init(PIN_LCD_RST, 1);
    gpio_output_init(PIN_LCD_SCK, 0);
    gpio_output_init(PIN_LCD_MOSI, 0);
    hold_signal("CS", PIN_LCD_CS, 0);
    hold_signal("CS", PIN_LCD_CS, 1);
    hold_signal("CS", PIN_LCD_CS, 0);

    hold_signal("DC", PIN_LCD_DC, 0);
    hold_signal("DC", PIN_LCD_DC, 1);
    hold_signal("DC", PIN_LCD_DC, 0);

    hold_signal("RESET", PIN_LCD_RST, 0);
    hold_signal("RESET", PIN_LCD_RST, 1);
    hold_signal("RESET", PIN_LCD_RST, 0);

    hold_signal("SCK", PIN_LCD_SCK, 0);
    hold_signal("SCK", PIN_LCD_SCK, 1);
    hold_signal("SCK", PIN_LCD_SCK, 0);

    hold_signal("MOSI", PIN_LCD_MOSI, 0);
    hold_signal("MOSI", PIN_LCD_MOSI, 1);
    hold_signal("MOSI", PIN_LCD_MOSI, 0);

    hold_signal("BACKLIGHT", PIN_LCD_BL, 0);
    hold_signal("BACKLIGHT", PIN_LCD_BL, 1);
    printf("GPIO diagnostic complete.\n");
    fflush(stdout);
}

static esp_err_t lcd_tx_param(int lcd_cmd, const void *param, size_t param_size)
{
    ESP_RETURN_ON_FALSE(s_io != NULL, ESP_ERR_INVALID_STATE, TAG, "LCD IO not ready");
    return esp_lcd_panel_io_tx_param(s_io, lcd_cmd, param, param_size);
}

static esp_err_t lcd_tx_color(int lcd_cmd, const void *color, size_t color_size)
{
    ESP_RETURN_ON_FALSE(s_io != NULL, ESP_ERR_INVALID_STATE, TAG, "LCD IO not ready");
    return esp_lcd_panel_io_tx_color(s_io, lcd_cmd, color, color_size);
}

static esp_err_t lcd_set_direction(uint8_t direction)
{
    static const uint8_t madctl_map[] = {
        (1 << 3) | (1 << 6),
        (1 << 3) | (1 << 5),
        (1 << 3) | (1 << 7),
        (1 << 3) | (1 << 7) | (1 << 6) | (1 << 5),
    };
    const uint8_t dir = direction % 4;
    return lcd_tx_param(0x36, &madctl_map[dir], 1);
}

static void probe_registers(const char *when)
{
    if (!s_io) {
        return;
    }

    uint8_t id[5] = {0};
    uint8_t pm[1] = {0};
    uint8_t st[4] = {0};

    printf("REGISTER PROBE: %s\n", when);
    fflush(stdout);
    ESP_ERROR_CHECK(esp_lcd_panel_io_rx_param(s_io, 0x04, id, sizeof(id)));
    ESP_LOGI(TAG, "RDDID -> %02X %02X %02X %02X %02X", id[0], id[1], id[2], id[3], id[4]);
    ESP_ERROR_CHECK(esp_lcd_panel_io_rx_param(s_io, 0x0A, pm, sizeof(pm)));
    ESP_LOGI(TAG, "RDDPM -> %02X", pm[0]);
    ESP_ERROR_CHECK(esp_lcd_panel_io_rx_param(s_io, 0x09, st, sizeof(st)));
    ESP_LOGI(TAG, "RDDST -> %02X %02X %02X %02X", st[0], st[1], st[2], st[3]);
}

static void touch_i2c_release(void)
{
    if (s_touch_ready) {
        i2c_driver_delete(I2C_NUM_0);
        s_touch_ready = false;
    }
    s_touch_sda = -1;
    s_touch_scl = -1;
}

static esp_err_t touch_i2c_init_on_pair(int sda, int scl)
{
    i2c_config_t cfg = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = sda,
        .scl_io_num = scl,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = 100000,
        .clk_flags = 0,
    };

    ESP_RETURN_ON_ERROR(i2c_param_config(I2C_NUM_0, &cfg), TAG, "i2c_param_config failed");
    ESP_RETURN_ON_ERROR(i2c_driver_install(I2C_NUM_0, cfg.mode, 0, 0, 0),
                        TAG, "i2c_driver_install failed");

    uint8_t status = 0;
    esp_err_t err = i2c_master_write_read_device(I2C_NUM_0, TOUCH_I2C_ADDR,
                                                 (uint8_t[]){0x02}, 1,
                                                 &status, 1, pdMS_TO_TICKS(50));
    if (err != ESP_OK) {
        i2c_driver_delete(I2C_NUM_0);
        return err;
    }

    s_touch_ready = true;
    s_touch_sda = sda;
    s_touch_scl = scl;
    return ESP_OK;
}

static esp_err_t touch_i2c_init(void)
{
    touch_i2c_release();
    esp_err_t err = touch_i2c_init_on_pair(PIN_CTP_SDA, PIN_CTP_SCL);
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "FT6336U touch online on SDA=%d SCL=%d", s_touch_sda, s_touch_scl);
        return ESP_OK;
    }

    ESP_LOGW(TAG, "FT6336U probe failed on SDA=%d SCL=%d: %s",
             PIN_CTP_SDA, PIN_CTP_SCL, esp_err_to_name(err));
    return err;
}

static esp_err_t touch_read_reg(uint8_t reg, uint8_t *data, size_t len)
{
    ESP_RETURN_ON_FALSE(s_touch_ready, ESP_ERR_INVALID_STATE, TAG, "touch I2C not ready");
    return i2c_master_write_read_device(I2C_NUM_0, TOUCH_I2C_ADDR, &reg, 1,
                                        data, len, pdMS_TO_TICKS(50));
}

static esp_err_t touch_read_point(int *x, int *y, int *count)
{
    uint8_t status = 0;
    ESP_RETURN_ON_ERROR(touch_read_reg(0x02, &status, 1), TAG, "touch status read failed");

    const int touches = status & 0x0F;
    if (count) {
        *count = touches;
    }
    if (touches <= 0) {
        return ESP_ERR_NOT_FOUND;
    }

    uint8_t p[4] = {0};
    ESP_RETURN_ON_ERROR(touch_read_reg(0x03, p, sizeof(p)), TAG, "touch point read failed");

    const int raw_x = (((int)p[0]) & 0x0F) << 8 | p[1];
    const int raw_y = (((int)p[2]) & 0x0F) << 8 | p[3];
    if (x) {
        *x = raw_x;
    }
    if (y) {
        *y = raw_y;
    }
    return ESP_OK;
}

static void touch_draw_marker(int x, int y, int count)
{
    if (x < 0 || y < 0) {
        return;
    }
    if (x >= LCD_WIDTH) {
        x = LCD_WIDTH - 1;
    }
    if (y >= LCD_HEIGHT) {
        y = LCD_HEIGHT - 1;
    }

    const uint16_t color = (count > 1) ? 0xFFE0 : 0xF800;
    lcd_fill_rect(x - 3 < 0 ? 0 : x - 3, y - 3 < 0 ? 0 : y - 3, 7, 7, color);
    lcd_fill_rect(x, y, 1, 1, 0xFFFF);
}

static void run_touch_demo_loop(void)
{
    if (!s_touch_ready) {
        printf("TOUCH DISABLED: no FT6336U response\n");
        fflush(stdout);
        while (1) {
            delay_ms(1000);
        }
    }

    printf("TOUCH DEMO: poll TD_STATUS at 0x38 over SDA=%d SCL=%d\n",
           s_touch_sda, s_touch_scl);
    fflush(stdout);

    while (1) {
        int x = -1;
        int y = -1;
        int count = 0;
        esp_err_t err = touch_read_point(&x, &y, &count);
        if (err == ESP_OK) {
            printf("TOUCH: points=%d x=%d y=%d\n", count, x, y);
            fflush(stdout);
            touch_draw_marker(x, y, count);
            delay_ms(50);
            continue;
        }
        if (err != ESP_ERR_NOT_FOUND) {
            ESP_LOGW(TAG, "touch poll failed: %s", esp_err_to_name(err));
        }
        delay_ms(20);
    }
}

static void touch_background_task(void *arg)
{
    (void)arg;

    /* Give the panel a little time to settle so the LCD demo stays visible
     * even if the touch controller or its I2C bus is unhappy. */
    delay_ms(2000);

    esp_err_t touch_err = touch_i2c_init();
    if (touch_err != ESP_OK) {
        printf("TOUCH SCAN PAUSED: no FT6336U response, keeping LCD stable\n");
        fflush(stdout);
        vTaskDelete(NULL);
        return;
    }

    printf("TOUCH READY: FT6336U on SDA=%d SCL=%d\n", s_touch_sda, s_touch_scl);
    fflush(stdout);
    run_touch_demo_loop();
    vTaskDelete(NULL);
}

static esp_err_t lcd_hw_init_sequence(void)
{
    gpio_set_level((gpio_num_t)PIN_LCD_RST, 1);
    delay_ms(10);
    gpio_set_level((gpio_num_t)PIN_LCD_RST, 0);
    delay_ms(30);
    gpio_set_level((gpio_num_t)PIN_LCD_RST, 1);
    delay_ms(150);

    ESP_RETURN_ON_ERROR(lcd_tx_param(0x01, NULL, 0), TAG, "software reset failed");
    delay_ms(150);
    ESP_RETURN_ON_ERROR(lcd_tx_param(0x11, NULL, 0), TAG, "sleep out failed");
    delay_ms(120);

    ESP_RETURN_ON_ERROR(lcd_tx_param(0xF0, (uint8_t[]){0xC3}, 1),
                        TAG, "unlock 1 failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xF0, (uint8_t[]){0x96}, 1),
                        TAG, "unlock 2 failed");
    ESP_RETURN_ON_ERROR(lcd_set_direction(0), TAG, "madctl failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0x3A, (uint8_t[]){0x05}, 1),
                        TAG, "pixel format failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xB0, (uint8_t[]){0x80}, 1),
                        TAG, "interface mode failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xB6, (uint8_t[]){0x00, 0x02}, 2),
                        TAG, "display function failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xB5, (uint8_t[]){0x02, 0x03, 0x00, 0x04}, 4),
                        TAG, "frame control failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xB1, (uint8_t[]){0x80, 0x10}, 2),
                        TAG, "frame rate failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xB4, (uint8_t[]){0x00}, 1),
                        TAG, "display inversion failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xB7, (uint8_t[]){0xC6}, 1),
                        TAG, "entry mode failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xC5, (uint8_t[]){0x1C}, 1),
                        TAG, "vcom failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xE4, (uint8_t[]){0x31}, 1),
                        TAG, "gamma 1 failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xE8, (uint8_t[]){0x40, 0x8A, 0x00, 0x00, 0x29, 0x19, 0xA5, 0x33}, 8),
                        TAG, "pump ratio failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xC2, NULL, 0), TAG, "c2 failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xA7, NULL, 0), TAG, "a7 failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xE0, (uint8_t[]){0xF0, 0x09, 0x13, 0x12, 0x12, 0x2B, 0x3C, 0x44,
                                                       0x4B, 0x1B, 0x18, 0x17, 0x1D, 0x21}, 14),
                        TAG, "positive gamma failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xE1, (uint8_t[]){0xF0, 0x09, 0x13, 0x0C, 0x0D, 0x27, 0x3B, 0x44,
                                                       0x4D, 0x0B, 0x17, 0x17, 0x1D, 0x21}, 14),
                        TAG, "negative gamma failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xF0, (uint8_t[]){0x3C}, 1),
                        TAG, "relock 1 failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0xF0, (uint8_t[]){0x69}, 1),
                        TAG, "relock 2 failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0x13, NULL, 0), TAG, "normal display failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0x11, NULL, 0), TAG, "sleep out confirm failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0x29, NULL, 0), TAG, "display on failed");
    delay_ms(100);
    return ESP_OK;
}

static void lcd_release(void)
{
    if (s_io) {
        esp_lcd_panel_io_del(s_io);
        s_io = NULL;
    }
}

static esp_err_t lcd_create(int spi_mode, int spi_hz)
{
    gpio_output_init(PIN_LCD_RST, 1);
    gpio_output_init(PIN_LCD_CS, 1);
    gpio_output_init(PIN_LCD_DC, 0);
    gpio_output_init(PIN_LCD_SCK, 0);
    gpio_output_init(PIN_LCD_MOSI, 0);
    gpio_output_init(PIN_LCD_BL, 1);

    esp_lcd_panel_io_spi_config_t io_cfg = {
        .dc_gpio_num = PIN_LCD_DC,
        .cs_gpio_num = PIN_LCD_CS,
        .pclk_hz = spi_hz,
        .lcd_cmd_bits = LCD_CMD_BITS,
        .lcd_param_bits = LCD_PARAM_BITS,
        .spi_mode = spi_mode,
        .trans_queue_depth = 10,
    };
    ESP_RETURN_ON_ERROR(esp_lcd_new_panel_io_spi_local(0, &io_cfg, &s_io),
                        TAG, "esp_lcd_new_panel_io_spi_local failed");
    ESP_RETURN_ON_ERROR(lcd_hw_init_sequence(), TAG, "panel init failed");
    probe_registers("after init");

    return ESP_OK;
}

static esp_err_t lcd_draw_bitmap_raw(int x_start, int y_start, int x_end, int y_end, const void *color_data)
{
    ESP_RETURN_ON_FALSE(s_io != NULL, ESP_ERR_INVALID_STATE, TAG, "LCD IO not ready");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0x2A, (uint8_t[]) {
        (x_start >> 8) & 0xFF,
        x_start & 0xFF,
        ((x_end - 1) >> 8) & 0xFF,
        (x_end - 1) & 0xFF,
    }, 4), TAG, "set column failed");
    ESP_RETURN_ON_ERROR(lcd_tx_param(0x2B, (uint8_t[]) {
        (y_start >> 8) & 0xFF,
        y_start & 0xFF,
        ((y_end - 1) >> 8) & 0xFF,
        (y_end - 1) & 0xFF,
    }, 4), TAG, "set row failed");
    size_t len = (size_t)(x_end - x_start) * (size_t)(y_end - y_start) * 2;
    return lcd_tx_color(0x2C, color_data, len);
}

static void lcd_fill_screen(uint16_t color)
{
    const int band_rows = 1;
    if (g_lcd_use_rgb666) {
        uint8_t *row = heap_caps_malloc((size_t)LCD_WIDTH * band_rows * 3, MALLOC_CAP_DMA);
        if (!row) {
            ESP_LOGE(TAG, "band buffer allocation failed");
            return;
        }
        const uint8_t r = (uint8_t)((color >> 8) & 0xF8);
        const uint8_t g = (uint8_t)((color >> 3) & 0xFC);
        const uint8_t b = (uint8_t)((color << 3) & 0xF8);
        for (size_t i = 0; i < (size_t)LCD_WIDTH * band_rows; ++i) {
            row[i * 3 + 0] = b;
            row[i * 3 + 1] = g;
            row[i * 3 + 2] = r;
        }
        for (int y = 0; y < LCD_HEIGHT; y += band_rows) {
            const int rows = (y + band_rows > LCD_HEIGHT) ? (LCD_HEIGHT - y) : band_rows;
            ESP_ERROR_CHECK(lcd_draw_bitmap_raw(0, y, LCD_WIDTH, y + rows, row));
        }
        free(row);
        return;
    }

    uint16_t *row = heap_caps_malloc((size_t)LCD_WIDTH * band_rows * sizeof(uint16_t),
                                     MALLOC_CAP_DMA);
    if (!row) {
        ESP_LOGE(TAG, "band buffer allocation failed");
        return;
    }
    for (size_t i = 0; i < (size_t)LCD_WIDTH * band_rows; ++i) {
        row[i] = color;
    }
    for (int y = 0; y < LCD_HEIGHT; y += band_rows) {
        const int rows = (y + band_rows > LCD_HEIGHT) ? (LCD_HEIGHT - y) : band_rows;
        ESP_ERROR_CHECK(lcd_draw_bitmap_raw(0, y, LCD_WIDTH, y + rows, row));
    }
    free(row);
}

static void lcd_fill_rect(int x, int y, int w, int h, uint16_t color)
{
    if (w <= 0 || h <= 0) {
        return;
    }

    if (g_lcd_use_rgb666) {
        uint8_t *row = heap_caps_malloc((size_t)w * 3, MALLOC_CAP_DMA);
        if (!row) {
            ESP_LOGE(TAG, "rect buffer allocation failed");
            return;
        }
        const uint8_t r = (uint8_t)((color >> 8) & 0xF8);
        const uint8_t g = (uint8_t)((color >> 3) & 0xFC);
        const uint8_t b = (uint8_t)((color << 3) & 0xF8);
        for (int i = 0; i < w; ++i) {
            row[i * 3 + 0] = b;
            row[i * 3 + 1] = g;
            row[i * 3 + 2] = r;
        }
        for (int yy = 0; yy < h; ++yy) {
            ESP_ERROR_CHECK(lcd_draw_bitmap_raw(x, y + yy, x + w, y + yy + 1, row));
        }
        free(row);
        return;
    }

    uint16_t *row = heap_caps_malloc((size_t)w * sizeof(uint16_t), MALLOC_CAP_DMA);
    if (!row) {
        ESP_LOGE(TAG, "rect buffer allocation failed");
        return;
    }
    for (int i = 0; i < w; ++i) {
        row[i] = color;
    }
    for (int yy = 0; yy < h; ++yy) {
        ESP_ERROR_CHECK(lcd_draw_bitmap_raw(x, y + yy, x + w, y + yy + 1, row));
    }
    free(row);
}

static void lcd_draw_pixel(int x, int y, uint16_t color)
{
    lcd_fill_rect(x, y, 1, 1, color);
}

static void lcd_draw_line(int x0, int y0, int x1, int y1, uint16_t color)
{
    const int dx = abs(x1 - x0);
    const int sx = x0 < x1 ? 1 : -1;
    const int dy = -abs(y1 - y0);
    const int sy = y0 < y1 ? 1 : -1;
    int err = dx + dy;

    int step = 0;
    for (;;) {
        lcd_draw_pixel(x0, y0, color);
        ++step;
        if (x0 == x1 && y0 == y1) {
            break;
        }
        const int e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
}

static void lcd_draw_rect_outline(int x, int y, int w, int h, uint16_t color)
{
    lcd_draw_line(x, y, x + w - 1, y, color);
    lcd_draw_line(x, y, x, y + h - 1, color);
    lcd_draw_line(x + w - 1, y, x + w - 1, y + h - 1, color);
    lcd_draw_line(x, y + h - 1, x + w - 1, y + h - 1, color);
}

static void lcd_draw_circle(int cx, int cy, int r, uint16_t color)
{
    int x = r;
    int y = 0;
    int err = 0;

    while (x >= y) {
        lcd_draw_pixel(cx + x, cy + y, color);
        lcd_draw_pixel(cx + y, cy + x, color);
        lcd_draw_pixel(cx - y, cy + x, color);
        lcd_draw_pixel(cx - x, cy + y, color);
        lcd_draw_pixel(cx - x, cy - y, color);
        lcd_draw_pixel(cx - y, cy - x, color);
        lcd_draw_pixel(cx + y, cy - x, color);
        lcd_draw_pixel(cx + x, cy - y, color);
        if (err <= 0) {
            ++y;
            err += 2 * y + 1;
        }
        if (err > 0) {
            --x;
            err -= 2 * x + 1;
        }
    }
}

static const glyph_t *find_glyph(char ch)
{
    for (size_t i = 0; i < sizeof(s_font) / sizeof(s_font[0]); ++i) {
        if (s_font[i].ch == ch) {
            return &s_font[i];
        }
    }
    return NULL;
}

static void lcd_draw_char(int x, int y, int scale, uint16_t fg, uint16_t bg, char ch)
{
    const glyph_t *g = find_glyph(ch);
    if (!g) {
        g = find_glyph(' ');
    }

    const int w = 5 * scale;
    const int h = 7 * scale;
    lcd_fill_rect(x, y, w, h, bg);
    for (int row = 0; row < 7; ++row) {
        for (int col = 0; col < 5; ++col) {
            const bool on = (g->rows[row] >> (4 - col)) & 0x1;
            if (on) {
                lcd_fill_rect(x + col * scale, y + row * scale, scale, scale, fg);
            }
        }
    }
}

static void lcd_draw_text(int x, int y, int scale, uint16_t fg, uint16_t bg, const char *text)
{
    int cursor_x = x;
    for (const char *p = text; *p; ++p) {
        if (*p == '\n') {
            cursor_x = x;
            y += (7 * scale) + scale;
            continue;
        }
        lcd_draw_char(cursor_x, y, scale, fg, bg, *p);
        cursor_x += (5 * scale) + scale;
    }
}

static void lcd_draw_test_scene(const char *title, const char *subtitle)
{
    (void)title;
    (void)subtitle;
    lcd_fill_screen(0x0000);
    lcd_fill_rect(0, 0, 64, 64, 0xF800);
    lcd_fill_rect(64, 0, 64, 64, 0x07E0);
    lcd_fill_rect(0, 64, 64, 64, 0x001F);
    lcd_fill_rect(64, 64, 64, 64, 0xFFFF);
}

static void lcd_draw_demo_mark(void)
{
    /* Make the first frame obviously different from a white backlight. */
    lcd_fill_screen(0x0000);
    lcd_fill_rect(0, 0, 24, 24, 0xF800);
    printf("DEMO FRAME DRAWN\n");
    fflush(stdout);
}

static void run_basic_color_cycle(void)
{
    for (size_t i = 0; i < sizeof(s_color_names) / sizeof(s_color_names[0]); ++i) {
        printf("COLOR TEST: %s\n", s_color_names[i]);
        fflush(stdout);
        lcd_fill_screen(s_color_values[i]);
        delay_ms(600);
    }
}

static esp_err_t run_orientation_test(void)
{
    struct {
        const char *name;
        bool swap_xy;
        bool mirror_x;
        bool mirror_y;
    } rotations[] = {
        { "ROTATION 0", false, false, false },
        { "ROTATION 1", true,  false, true  },
        { "ROTATION 2", false, true,  true  },
        { "ROTATION 3", true,  true,  false },
    };

    ESP_RETURN_ON_FALSE(s_panel != NULL, ESP_ERR_INVALID_STATE, TAG, "panel handle not available");
    for (size_t i = 0; i < sizeof(rotations) / sizeof(rotations[0]); ++i) {
        ESP_RETURN_ON_ERROR(esp_lcd_panel_swap_xy(s_panel, rotations[i].swap_xy), TAG, "swap_xy failed");
        ESP_RETURN_ON_ERROR(esp_lcd_panel_mirror(s_panel, rotations[i].mirror_x, rotations[i].mirror_y),
                            TAG, "mirror failed");
        printf("ORIENTATION TEST: %s\n", rotations[i].name);
        fflush(stdout);
        lcd_draw_test_scene("WISE2", rotations[i].name);
        delay_ms(250);
    }

    return ESP_OK;
}

static esp_err_t run_clock_ladder(void)
{
    const int hz_tests[] = {
        2000000,
        4000000,
        10000000,
        20000000,
    };

    for (size_t i = 0; i < sizeof(hz_tests) / sizeof(hz_tests[0]); ++i) {
        printf("SPI CLOCK TEST: %d MHz\n", hz_tests[i] / 1000000);
        fflush(stdout);
        lcd_release();
        delay_ms(50);
        ESP_RETURN_ON_ERROR(lcd_create(0, hz_tests[i]), TAG, "clock ladder init failed");
        run_basic_color_cycle();
    }

    return ESP_OK;
}

static esp_err_t run_display_bringup(int spi_mode, int spi_hz)
{
    printf("ST7796S LCD INIT START\n");
    fflush(stdout);
    ESP_RETURN_ON_ERROR(lcd_create(spi_mode, spi_hz), TAG, "base lcd init failed");
    printf("RESET COMPLETE\n");
    printf("SPI INITIALIZED\n");
    printf("DISPLAY INIT COMPLETE\n");
    fflush(stdout);
    lcd_draw_demo_mark();
    delay_ms(1000);
    return ESP_OK;
}

static void print_failure_and_stop(const char *stage, esp_err_t err)
{
    ESP_LOGE(TAG, "%s failed: %s", stage, esp_err_to_name(err));
    printf("==============================================\n");
    printf(" LCD BRING-UP FAILED\n");
    printf(" Stage: %s\n", stage);
    printf(" Error: %s\n", esp_err_to_name(err));
    printf(" Check GPIO map, reset timing, CS/DC/SCK/MOSI,\n");
    printf(" panel power, and SPI host wiring before changing init.\n");
    printf("==============================================\n");
    fflush(stdout);
    while (1) {
        delay_ms(1000);
    }
}

void app_main(void)
{
    log_banner();

    lcd_release();
    delay_ms(50);

    printf("SPI TRY: mode 3 / 10 MHz\n");
    fflush(stdout);

    esp_err_t err = run_display_bringup(3, 10000000);
    if (err != ESP_OK) {
        print_failure_and_stop("SPI bring-up", err);
    }

    run_basic_color_cycle();
    lcd_fill_screen(0x001F);
    printf("DEMO HOLD: BLUE\n");
    fflush(stdout);

    while (1) {
        delay_ms(1000);
    }
}
