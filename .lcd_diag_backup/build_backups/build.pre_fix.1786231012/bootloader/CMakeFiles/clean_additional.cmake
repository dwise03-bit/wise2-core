# Additional clean files
cmake_minimum_required(VERSION 3.16)

if("${CONFIG}" STREQUAL "" OR "${CONFIG}" STREQUAL "")
  file(REMOVE_RECURSE
  "bootloader.map"
  "esp-idf/mbedtls/x509_crt_bundle"
  "https_server.crt.S"
  "littlefs_py_venv"
  "project_elf_src_esp32.c"
  "rmaker_claim_service_server.crt.S"
  "rmaker_mqtt_server.crt.S"
  "rmaker_ota_server.crt.S"
  "x509_crt_bundle.S"
  )
endif()
