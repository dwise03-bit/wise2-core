cmake_minimum_required(VERSION 3.16)

# Set the target BEFORE including the ESP-IDF project
set(IDF_TARGET esp32c5)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(byte_mini_4.0 C CXX ASM)
