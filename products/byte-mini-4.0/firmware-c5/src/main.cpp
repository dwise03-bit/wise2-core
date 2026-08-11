#include <stdio.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <esp_log.h>
#include "lcd_driver.h"

static const char *TAG = "TEST";

extern "C" void app_main(void) {
    ESP_LOGI(TAG, "=== MADCTL Diagnostic ===\n");

    lcd_init();
    ESP_LOGI(TAG, "LCD initialized\n");

    // Test brightness changes: BLACK → WHITE cycle
    // If display brightness changes, pixels are working (just wrong MADCTL)
    // If display stays same, pixels aren't being written

    ESP_LOGI(TAG, "Testing: BLACK → WHITE (2 sec each)\n");

    while (1) {
        ESP_LOGI(TAG, "BLACK");
        lcd_fill_color(COLOR_BLACK);
        vTaskDelay(2000 / portTICK_PERIOD_MS);

        ESP_LOGI(TAG, "WHITE");
        lcd_fill_color(COLOR_WHITE);
        vTaskDelay(2000 / portTICK_PERIOD_MS);

        ESP_LOGI(TAG, "RED");
        lcd_fill_color(COLOR_RED);
        vTaskDelay(2000 / portTICK_PERIOD_MS);

        ESP_LOGI(TAG, "GREEN");
        lcd_fill_color(COLOR_GREEN);
        vTaskDelay(2000 / portTICK_PERIOD_MS);

        ESP_LOGI(TAG, "BLUE");
        lcd_fill_color(COLOR_BLUE);
        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}
