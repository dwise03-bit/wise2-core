idf_component_register(
    SRCS "main.cpp" "lcd_driver.cpp"
    INCLUDE_DIRS "."
    REQUIRES driver esp_common
)

