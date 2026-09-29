cmake_minimum_required(VERSION 3.16)
set(ENV{IDF_COMPONENT_MANAGER} 0)
set(EXCLUDE_COMPONENTS
    arduino-esp32
    esp_http_client
    esp_http_server
    esp_https_ota
    esp_https_server
    esp_local_ctrl
    esp_netif
    esp_eth
    esp_gdbstub
    esp_hid
    esp_wifi
    mqtt
    protocomm
    wifi_provisioning
    esp_tls
)
include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(byte_lcd_diag)
