/*
 * Local write-only panel IO for the ST7796S bring-up harness.
 *
 * This avoids the hardware SPI panel helper so the app can build against the
 * release ESP32-C5 target while still driving the panel through the existing
 * esp_lcd ST7796S panel driver.
 */

#include <stdbool.h>
#include <stdlib.h>

#include "driver/gpio.h"
#include "esp_check.h"
#include "esp_lcd_io_spi.h"
#include "hal/gpio_ll.h"
#include "esp_lcd_panel_io_interface.h"
#include "esp_rom_sys.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static const char *TAG = "lcd_panel.io.local";

extern bool g_lcd_use_rgb666;

#define PIN_LCD_SCK   6
#define PIN_LCD_MOSI  7
#define PIN_LCD_MISO  2

typedef struct {
    esp_lcd_panel_io_t base;
    int cs_gpio_num;
    int dc_gpio_num;
    int sck_gpio_num;
    int mosi_gpio_num;
    int miso_gpio_num;
    int spi_mode;
    int lcd_cmd_bits;
    int lcd_param_bits;
    uint32_t bit_delay_us;
    unsigned int dc_cmd_level : 1;
    unsigned int dc_data_level : 1;
    unsigned int dc_param_level : 1;
    esp_lcd_panel_io_color_trans_done_cb_t on_color_trans_done;
    void *user_ctx;
} esp_lcd_panel_io_spi_local_t;

static inline void spi_delay(const esp_lcd_panel_io_spi_local_t *io)
{
    if (io->bit_delay_us > 0) {
        esp_rom_delay_us(io->bit_delay_us);
    }
}

static inline void spi_write_bit(const esp_lcd_panel_io_spi_local_t *io, bool bit)
{
    gpio_ll_set_level(&GPIO, (uint32_t)io->mosi_gpio_num, bit ? 1 : 0);
    spi_delay(io);
    if (io->spi_mode == 3) {
        gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, 0);
        spi_delay(io);
        gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, 1);
    } else {
        gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, 1);
        spi_delay(io);
        gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, 0);
    }
}

static void spi_write_byte(const esp_lcd_panel_io_spi_local_t *io, uint8_t value)
{
    for (int bit = 7; bit >= 0; --bit) {
        spi_write_bit(io, (value >> bit) & 0x1);
    }
}

static void spi_begin(const esp_lcd_panel_io_spi_local_t *io)
{
    gpio_ll_set_level(&GPIO, (uint32_t)io->cs_gpio_num, 0);
    gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, (io->spi_mode == 3) ? 1 : 0);
}

static void spi_end(const esp_lcd_panel_io_spi_local_t *io)
{
    gpio_ll_set_level(&GPIO, (uint32_t)io->cs_gpio_num, 1);
}

static inline bool spi_read_bit(const esp_lcd_panel_io_spi_local_t *io)
{
    bool bit;
    if (io->spi_mode == 3) {
        gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, 0);
        spi_delay(io);
        bit = gpio_ll_get_level(&GPIO, (uint32_t)io->miso_gpio_num);
        gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, 1);
    } else {
        gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, 1);
        spi_delay(io);
        bit = gpio_ll_get_level(&GPIO, (uint32_t)io->miso_gpio_num);
        gpio_ll_set_level(&GPIO, (uint32_t)io->sck_gpio_num, 0);
    }
    spi_delay(io);
    return bit;
}

static uint8_t spi_read_byte(const esp_lcd_panel_io_spi_local_t *io)
{
    uint8_t value = 0;
    for (int bit = 7; bit >= 0; --bit) {
        if (spi_read_bit(io)) {
            value |= (uint8_t)(1U << bit);
        }
    }
    return value;
}

static void set_dc_level(const esp_lcd_panel_io_spi_local_t *io, bool is_cmd, bool is_color)
{
    if (io->dc_gpio_num < 0) {
        return;
    }

    int level = io->dc_param_level;
    if (is_color) {
        level = io->dc_data_level;
    } else if (is_cmd) {
        level = io->dc_cmd_level;
    }
    gpio_ll_set_level(&GPIO, (uint32_t)io->dc_gpio_num, (uint32_t)level);
}

static esp_err_t panel_io_spi_rx_param(esp_lcd_panel_io_t *io, int lcd_cmd, void *param, size_t param_size)
{
    esp_lcd_panel_io_spi_local_t *spi_io = __containerof(io, esp_lcd_panel_io_spi_local_t, base);
    uint8_t *out = (uint8_t *)param;
    if (!out || param_size == 0) {
        return ESP_ERR_INVALID_ARG;
    }

    spi_begin(spi_io);

    if (lcd_cmd >= 0) {
        set_dc_level(spi_io, true, false);
        spi_write_byte(spi_io, (uint8_t)lcd_cmd);
    }

    set_dc_level(spi_io, false, false);
    gpio_ll_set_level(&GPIO, (uint32_t)spi_io->mosi_gpio_num, 0);

    /* Most readback commands need at least one dummy byte. */
    (void)spi_read_byte(spi_io);
    for (size_t i = 0; i < param_size; ++i) {
        out[i] = spi_read_byte(spi_io);
    }

    spi_end(spi_io);
    return ESP_OK;
}

static esp_err_t panel_io_spi_tx_param(esp_lcd_panel_io_t *io, int lcd_cmd, const void *param, size_t param_size)
{
    esp_lcd_panel_io_spi_local_t *spi_io = __containerof(io, esp_lcd_panel_io_spi_local_t, base);
    bool send_cmd = lcd_cmd >= 0;
    bool send_param = param != NULL && param_size > 0;
    spi_begin(spi_io);

    if (send_cmd) {
        set_dc_level(spi_io, true, false);
        spi_write_byte(spi_io, (uint8_t)lcd_cmd);
    }

    if (send_param) {
        set_dc_level(spi_io, false, false);
        const uint8_t *cursor = (const uint8_t *)param;
        for (size_t i = 0; i < param_size; ++i) {
            spi_write_byte(spi_io, cursor[i]);
        }
    }

    spi_end(spi_io);
    return ESP_OK;
}

static esp_err_t panel_io_spi_tx_color(esp_lcd_panel_io_t *io, int lcd_cmd, const void *color, size_t color_size)
{
    esp_lcd_panel_io_spi_local_t *spi_io = __containerof(io, esp_lcd_panel_io_spi_local_t, base);
    const uint8_t *cursor = (const uint8_t *)color;

    spi_begin(spi_io);

    if (lcd_cmd >= 0) {
        set_dc_level(spi_io, true, false);
        spi_write_byte(spi_io, (uint8_t)lcd_cmd);
    }

    if (color_size > 0) {
        set_dc_level(spi_io, false, true);
        if (g_lcd_use_rgb666) {
            for (size_t i = 0; i + 1 < color_size; i += 2) {
                const uint16_t px = (uint16_t)cursor[i] | ((uint16_t)cursor[i + 1] << 8);
                const uint8_t r = (uint8_t)((px >> 8) & 0xF8);
                const uint8_t g = (uint8_t)((px >> 3) & 0xFC);
                const uint8_t b = (uint8_t)((px << 3) & 0xF8);
                spi_write_byte(spi_io, b);
                spi_write_byte(spi_io, g);
                spi_write_byte(spi_io, r);
            }
        } else {
            for (size_t i = 0; i + 1 < color_size; i += 2) {
                spi_write_byte(spi_io, cursor[i + 1]);
                spi_write_byte(spi_io, cursor[i]);
            }
        }
        if ((color_size & 0x1) != 0) {
            spi_write_byte(spi_io, cursor[color_size - 1]);
        }
    }

    if (spi_io->on_color_trans_done && color_size > 0) {
        spi_io->on_color_trans_done(io, NULL, spi_io->user_ctx);
    }

    spi_end(spi_io);
    return ESP_OK;
}

static esp_err_t panel_io_spi_del(esp_lcd_panel_io_t *io)
{
    esp_lcd_panel_io_spi_local_t *spi_io = __containerof(io, esp_lcd_panel_io_spi_local_t, base);

    if (spi_io->cs_gpio_num >= 0) {
        gpio_reset_pin((gpio_num_t)spi_io->cs_gpio_num);
    }
    if (spi_io->dc_gpio_num >= 0) {
        gpio_reset_pin((gpio_num_t)spi_io->dc_gpio_num);
    }
    if (spi_io->sck_gpio_num >= 0) {
        gpio_reset_pin((gpio_num_t)spi_io->sck_gpio_num);
    }
    if (spi_io->mosi_gpio_num >= 0) {
        gpio_reset_pin((gpio_num_t)spi_io->mosi_gpio_num);
    }
    free(spi_io);
    return ESP_OK;
}

static esp_err_t panel_io_spi_register_event_callbacks(esp_lcd_panel_io_t *io,
        const esp_lcd_panel_io_callbacks_t *cbs, void *user_ctx)
{
    esp_lcd_panel_io_spi_local_t *spi_io = __containerof(io, esp_lcd_panel_io_spi_local_t, base);

    ESP_RETURN_ON_FALSE(cbs, ESP_ERR_INVALID_ARG, TAG, "callbacks are required");
    spi_io->on_color_trans_done = cbs->on_color_trans_done;
    spi_io->user_ctx = user_ctx;
    return ESP_OK;
}

esp_err_t esp_lcd_new_panel_io_spi_local(esp_lcd_spi_bus_handle_t bus,
                                         const esp_lcd_panel_io_spi_config_t *io_config,
                                         esp_lcd_panel_io_handle_t *ret_io)
{
    esp_lcd_panel_io_spi_local_t *spi_io = NULL;
    esp_err_t ret = ESP_OK;
    ESP_RETURN_ON_FALSE(io_config && ret_io, ESP_ERR_INVALID_ARG, TAG, "invalid argument");
    (void)bus;

    spi_io = calloc(1, sizeof(*spi_io));
    ESP_RETURN_ON_FALSE(spi_io, ESP_ERR_NO_MEM, TAG, "no memory for spi lcd panel io");

    spi_io->cs_gpio_num = io_config->cs_gpio_num;
    spi_io->dc_gpio_num = io_config->dc_gpio_num;
    spi_io->sck_gpio_num = PIN_LCD_SCK;
    spi_io->mosi_gpio_num = PIN_LCD_MOSI;
    spi_io->miso_gpio_num = PIN_LCD_MISO;
    spi_io->spi_mode = io_config->spi_mode;
    spi_io->lcd_cmd_bits = io_config->lcd_cmd_bits;
    spi_io->lcd_param_bits = io_config->lcd_param_bits;
    /* Keep the shim as fast as possible; the watchdog cannot tolerate slow
     * per-bit sleeps during panel init and frame updates. */
    spi_io->bit_delay_us = 0;
    spi_io->dc_cmd_level = io_config->flags.dc_high_on_cmd;
    spi_io->dc_data_level = !io_config->flags.dc_low_on_data;
    spi_io->dc_param_level = !io_config->flags.dc_low_on_param;
    spi_io->base.rx_param = panel_io_spi_rx_param;
    spi_io->base.tx_param = panel_io_spi_tx_param;
    spi_io->base.tx_color = panel_io_spi_tx_color;
    spi_io->base.del = panel_io_spi_del;
    spi_io->base.register_event_callbacks = panel_io_spi_register_event_callbacks;
    spi_io->on_color_trans_done = io_config->on_color_trans_done;
    spi_io->user_ctx = io_config->user_ctx;

    gpio_config_t out_cfg = {
        .mode = GPIO_MODE_OUTPUT,
        .pin_bit_mask = (1ULL << spi_io->cs_gpio_num) |
                        (1ULL << spi_io->dc_gpio_num) |
                        (1ULL << spi_io->sck_gpio_num) |
                        (1ULL << spi_io->mosi_gpio_num),
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    ret = gpio_config(&out_cfg);
    if (ret != ESP_OK) {
        goto fail;
    }

    gpio_set_level((gpio_num_t)spi_io->cs_gpio_num, 1);
    gpio_set_level((gpio_num_t)spi_io->sck_gpio_num, (spi_io->spi_mode == 3) ? 1 : 0);
    gpio_set_level((gpio_num_t)spi_io->mosi_gpio_num, 0);
    if (spi_io->dc_gpio_num >= 0) {
        gpio_set_level((gpio_num_t)spi_io->dc_gpio_num, spi_io->dc_param_level);
    }

    gpio_config_t in_cfg = {
        .mode = GPIO_MODE_INPUT,
        .pin_bit_mask = 1ULL << spi_io->miso_gpio_num,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .intr_type = GPIO_INTR_DISABLE,
    };
    ret = gpio_config(&in_cfg);
    if (ret != ESP_OK) {
        goto fail;
    }

    *ret_io = &spi_io->base;
    return ESP_OK;

fail:
    free(spi_io);
    return ret;
}
