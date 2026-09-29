cmake_minimum_required(VERSION 3.22.1)
project(openxr_vr)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# OpenXR
add_library(openxr_loader SHARED IMPORTED)
set_target_properties(openxr_loader PROPERTIES
    IMPORTED_LOCATION "${CMAKE_SOURCE_DIR}/../jniLibs/${ANDROID_ABI}/libopenxr_loader.so"
)

# Our VR library
add_library(openxr_vr SHARED openxr_vr.cpp)

target_link_libraries(openxr_vr PUBLIC
    openxr_loader
    log
    android
)

target_include_directories(openxr_vr PUBLIC
    "${CMAKE_SOURCE_DIR}/../../../../../../../../../../opt/openxr-sdk/include"
)
