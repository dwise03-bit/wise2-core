idf_component_register(
    SRCS
        "lcd_diag_native.c"
        "esp_lcd_panel_io_spi_local.c"
    INCLUDE_DIRS "."
    REQUIRES driver esp_driver_spi esp_lcd esp_lcd_st7796 heap esp_timer esp_system
    PRIV_REQUIRES spi_flash
)
