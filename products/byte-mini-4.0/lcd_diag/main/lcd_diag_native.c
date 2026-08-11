/*
 * WISE2 BYTE MINI 4.0 - native SPI ST7796 bring-up
 *
 * This version uses the real ESP-IDF SPI bus + panel IO path and the vendored
 * ST7796 panel component. It keeps the hardware stack as close to a normal
 * production driver path as possible.
 */

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "driver/gpio.h"
#include "driver/spi_master.h"
#include "esp_check.h"
#include "esp_chip_info.h"
#include "esp_flash.h"
#include "esp_heap_caps.h"
#include "esp_idf_version.h"
#include "esp_lcd_io_spi.h"
#include "esp_lcd_panel_io.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_st7796.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static const char *TAG = "BYTE-LCD";

#define FW_VERSION "WISE2 BYTE MINI 4.0 / native-spi lcd bring-up"

#define PIN_LCD_CS    9
#define PIN_LCD_DC    3
#define PIN_LCD_SCK   6
#define PIN_LCD_MOSI  7
#define PIN_LCD_MISO  2
#define PIN_LCD_RST   5
#define PIN_LCD_BL    10

#define LCD_SPI_HOST SPI2_HOST
#define LCD_H_RES    320
#define LCD_V_RES    480
#define LCD_PIXEL_CLOCK_HZ (1 * 1000 * 1000)

static esp_lcd_panel_handle_t s_panel = NULL;
static esp_lcd_panel_io_handle_t s_io = NULL;
static int s_w = LCD_H_RES;
static int s_h = LCD_V_RES;
static const bool s_panel_rgb666 = false;

static const st7796_lcd_init_cmd_t s_st7796_init_cmds[] = {
    { 0xF0, (uint8_t[]){ 0xC3 }, 1, 0 },
    { 0xF0, (uint8_t[]){ 0x96 }, 1, 0 },
    { 0x36, (uint8_t[]){ 0x48 }, 1, 0 },
    { 0x3A, (uint8_t[]){ 0x05 }, 1, 0 },
    { 0xB0, (uint8_t[]){ 0x80 }, 1, 0 },
    { 0xB6, (uint8_t[]){ 0x00, 0x02 }, 2, 0 },
    { 0xB5, (uint8_t[]){ 0x02, 0x03, 0x00, 0x04 }, 4, 0 },
    { 0xB1, (uint8_t[]){ 0x80, 0x10 }, 2, 0 },
    { 0xB4, (uint8_t[]){ 0x00 }, 1, 0 },
    { 0xB7, (uint8_t[]){ 0xC6 }, 1, 0 },
    { 0xC5, (uint8_t[]){ 0x1C }, 1, 0 },
    { 0xE4, (uint8_t[]){ 0x31 }, 1, 0 },
    { 0xE8, (uint8_t[]){ 0x40, 0x8A, 0x00, 0x00, 0x29, 0x19, 0xA5, 0x33 }, 8, 0 },
    { 0xC2, NULL, 0, 0 },
    { 0xA7, NULL, 0, 0 },
    { 0xE0, (uint8_t[]){ 0xF0, 0x09, 0x13, 0x12, 0x12, 0x2B, 0x3C, 0x44, 0x4B, 0x1B, 0x18, 0x17, 0x1D, 0x21 }, 14, 0 },
    { 0xE1, (uint8_t[]){ 0xF0, 0x09, 0x13, 0x0C, 0x0D, 0x27, 0x3B, 0x44, 0x4D, 0x0B, 0x17, 0x17, 0x1D, 0x21 }, 14, 0 },
    { 0xF0, (uint8_t[]){ 0x3C }, 1, 0 },
    { 0xF0, (uint8_t[]){ 0x69 }, 1, 0 },
};

static void delay_ms(int ms)
{
    vTaskDelay(pdMS_TO_TICKS(ms));
}

static esp_err_t lcd_tx_param(int lcd_cmd, const void *param, size_t param_size)
{
    ESP_RETURN_ON_FALSE(s_io != NULL, ESP_ERR_INVALID_STATE, TAG, "LCD IO not ready");
    return esp_lcd_panel_io_tx_param(s_io, lcd_cmd, param, param_size);
}

static void probe_registers(const char *when)
{
    if (!s_io) {
        return;
    }

    uint8_t id[5] = {0};
    uint8_t pm[1] = {0};
    uint8_t st[4] = {0};

    ESP_LOGI(TAG, "---- register readback (%s) ----", when);
    esp_err_t e1 = esp_lcd_panel_io_rx_param(s_io, 0x04, id, sizeof(id));
    ESP_LOGI(TAG, "  RDDID rc=%s -> %02X %02X %02X %02X %02X",
             esp_err_to_name(e1), id[0], id[1], id[2], id[3], id[4]);
    esp_err_t e2 = esp_lcd_panel_io_rx_param(s_io, 0x0A, pm, sizeof(pm));
    ESP_LOGI(TAG, "  RDDPM rc=%s -> %02X", esp_err_to_name(e2), pm[0]);
    esp_err_t e3 = esp_lcd_panel_io_rx_param(s_io, 0x09, st, sizeof(st));
    ESP_LOGI(TAG, "  RDDST rc=%s -> %02X %02X %02X %02X",
             esp_err_to_name(e3), st[0], st[1], st[2], st[3]);
    ESP_LOGI(TAG, "----------------------------------------");
}

static void print_banner(void)
{
    esp_chip_info_t chip;
    esp_chip_info(&chip);

    uint32_t flash_size = 0;
    esp_flash_get_size(NULL, &flash_size);

    printf("\n==================================================\n");
    printf(" %s\n", FW_VERSION);
    printf("==================================================\n");
    printf(" ESP-IDF    : %s\n", esp_get_idf_version());
    printf(" Target     : %s\n", CONFIG_IDF_TARGET);
    printf(" Core count : %d\n", chip.cores);
    printf(" Revision   : v%d.%d\n", chip.revision / 100, chip.revision % 100);
    printf(" Flash size : %lu MB\n", (unsigned long)(flash_size / (1024 * 1024)));
    printf("--------------------------------------------------\n");
    printf(" DISPLAY    : Hosyond 4.0in TFT SPI 480x320 V1.0\n");
    printf(" Panel      : %dx%d landscape native\n", LCD_H_RES, LCD_V_RES);
    printf(" SPI        : host=%d sweep mode=0/3 clock=1/2/4/10 MHz\n",
           LCD_SPI_HOST);
    printf(" GPIO       : CS=%d DC=%d RST=%d SCK=%d MOSI=%d BL=%d\n",
           PIN_LCD_CS, PIN_LCD_DC, PIN_LCD_RST, PIN_LCD_SCK, PIN_LCD_MOSI, PIN_LCD_BL);
    printf("--------------------------------------------------\n");
    printf(" Demo path  : native SPI + ST7796 driver\n");
    printf("==================================================\n\n");
    fflush(stdout);
}

static esp_err_t backlight_init(void)
{
    gpio_config_t io = {
        .mode = GPIO_MODE_OUTPUT,
        .pin_bit_mask = 1ULL << PIN_LCD_BL,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    ESP_RETURN_ON_ERROR(gpio_config(&io), TAG, "backlight gpio_config failed");
    gpio_set_level(PIN_LCD_BL, 1);
    return ESP_OK;
}

static esp_err_t lcd_create(int spi_mode, int hz)
{
    gpio_config_t rst_io = {
        .mode = GPIO_MODE_OUTPUT,
        .pin_bit_mask = 1ULL << PIN_LCD_RST,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    ESP_RETURN_ON_ERROR(gpio_config(&rst_io), TAG, "reset gpio_config failed");

    gpio_set_level(PIN_LCD_RST, 1);
    delay_ms(10);
    gpio_set_level(PIN_LCD_RST, 0);
    delay_ms(30);
    gpio_set_level(PIN_LCD_RST, 1);
    delay_ms(150);

    spi_bus_config_t buscfg = {
        .sclk_io_num = PIN_LCD_SCK,
        .mosi_io_num = PIN_LCD_MOSI,
        .miso_io_num = PIN_LCD_MISO,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .max_transfer_sz = LCD_H_RES * 80 * sizeof(uint16_t),
    };
    ESP_RETURN_ON_ERROR(spi_bus_initialize(LCD_SPI_HOST, &buscfg, SPI_DMA_CH_AUTO),
                        TAG, "spi_bus_initialize failed");

    esp_lcd_panel_io_spi_config_t io_cfg = {
        .dc_gpio_num = PIN_LCD_DC,
        .cs_gpio_num = PIN_LCD_CS,
        .pclk_hz = hz,
        .lcd_cmd_bits = 8,
        .lcd_param_bits = 8,
        .spi_mode = spi_mode,
        .trans_queue_depth = 10,
    };
    ESP_RETURN_ON_ERROR(esp_lcd_new_panel_io_spi((esp_lcd_spi_bus_handle_t)LCD_SPI_HOST,
                                                 &io_cfg, &s_io),
                        TAG, "esp_lcd_new_panel_io_spi failed");

    st7796_vendor_config_t vendor_cfg = {
        .init_cmds = s_st7796_init_cmds,
        .init_cmds_size = sizeof(s_st7796_init_cmds) / sizeof(s_st7796_init_cmds[0]),
    };
    esp_lcd_panel_dev_config_t panel_cfg = {
        .reset_gpio_num = PIN_LCD_RST,
        .rgb_ele_order = LCD_RGB_ELEMENT_ORDER_BGR,
        .bits_per_pixel = 16,
        .vendor_config = &vendor_cfg,
    };
    ESP_RETURN_ON_ERROR(esp_lcd_new_panel_st7796(s_io, &panel_cfg, &s_panel),
                        TAG, "esp_lcd_new_panel_st7796 failed");

    ESP_RETURN_ON_ERROR(esp_lcd_panel_reset(s_panel), TAG, "panel reset failed");
    delay_ms(120);
    ESP_RETURN_ON_ERROR(esp_lcd_panel_init(s_panel), TAG, "panel init failed");
    ESP_RETURN_ON_ERROR(esp_lcd_panel_swap_xy(s_panel, false), TAG, "swap_xy failed");
    ESP_RETURN_ON_ERROR(esp_lcd_panel_mirror(s_panel, false, false), TAG, "mirror failed");
    ESP_RETURN_ON_ERROR(esp_lcd_panel_invert_color(s_panel, false), TAG, "invert off failed");
    ESP_RETURN_ON_ERROR(esp_lcd_panel_disp_on_off(s_panel, true), TAG, "display on failed");
    probe_registers("after init + DISPON");
    return ESP_OK;
}

static void lcd_destroy(void)
{
    if (s_panel) {
        esp_lcd_panel_del(s_panel);
        s_panel = NULL;
    }
    if (s_io) {
        esp_lcd_panel_io_del(s_io);
        s_io = NULL;
    }
    spi_bus_free(LCD_SPI_HOST);
}

static void fill_screen(uint16_t colour)
{
    const int band_rows = 40;
    if (s_panel_rgb666) {
        uint8_t *buf = heap_caps_malloc((size_t)LCD_H_RES * band_rows * 3, MALLOC_CAP_DMA);
        if (!buf) {
            ESP_LOGE(TAG, "band buffer alloc failed");
            return;
        }

        const uint8_t r = (uint8_t)((colour >> 8) & 0xF8);
        const uint8_t g = (uint8_t)((colour >> 3) & 0xFC);
        const uint8_t b = (uint8_t)((colour << 3) & 0xF8);
        for (size_t i = 0; i < (size_t)LCD_H_RES * band_rows; ++i) {
            buf[i * 3 + 0] = b;
            buf[i * 3 + 1] = g;
            buf[i * 3 + 2] = r;
        }

        for (int y = 0; y < s_h; y += band_rows) {
            const int rows = (y + band_rows > s_h) ? (s_h - y) : band_rows;
            ESP_ERROR_CHECK(esp_lcd_panel_draw_bitmap(s_panel, 0, y, s_w, y + rows, buf));
        }

        free(buf);
        return;
    }

    uint16_t *buf = heap_caps_malloc((size_t)LCD_H_RES * band_rows * sizeof(uint16_t), MALLOC_CAP_DMA);
    if (!buf) {
        ESP_LOGE(TAG, "band buffer alloc failed");
        return;
    }

    for (size_t i = 0; i < (size_t)LCD_H_RES * band_rows; ++i) {
        buf[i] = colour;
    }

    for (int y = 0; y < s_h; y += band_rows) {
        const int rows = (y + band_rows > s_h) ? (s_h - y) : band_rows;
        ESP_ERROR_CHECK(esp_lcd_panel_draw_bitmap(s_panel, 0, y, s_w, y + rows, buf));
    }

    free(buf);
}

static void demo_cycle(void)
{
    const struct {
        const char *name;
        uint16_t color;
    } frames[] = {
        { "BLACK", 0x0000 },
        { "RED",   0xF800 },
        { "GREEN", 0x07E0 },
        { "BLUE",  0x001F },
        { "WHITE", 0xFFFF },
    };

    for (size_t i = 0; i < sizeof(frames) / sizeof(frames[0]); ++i) {
        printf("DEMO FRAME: %s\n", frames[i].name);
        fflush(stdout);
        fill_screen(frames[i].color);
        delay_ms(800);
    }

    printf("DEMO HOLD: BLUE\n");
    fflush(stdout);
    fill_screen(0x001F);
    while (1) {
        delay_ms(1000);
    }
}

static esp_err_t run_profile(int spi_mode, int hz)
{
    printf("\n########################################\n");
    printf("## TRY mode=%d clock=%d MHz\n", spi_mode, hz / 1000000);
    printf("########################################\n");
    fflush(stdout);

    lcd_destroy();
    delay_ms(50);

    esp_err_t err = lcd_create(spi_mode, hz);
    if (err != ESP_OK) {
        return err;
    }

    printf("LCD INIT COMPLETE\n");
    fflush(stdout);

    demo_cycle();
    return ESP_OK;
}

void app_main(void)
{
    print_banner();

    if (backlight_init() != ESP_OK) {
        ESP_LOGE(TAG, "backlight init failed");
    }

    esp_err_t err = run_profile(0, 1000000);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "profile failed: %s", esp_err_to_name(err));
    }
    while (1) {
        delay_ms(1000);
    }
}
