#pragma once

#include <stdint.h>

/**
 * Verified UNIHIKER K10 hardware constants.
 *
 * Every value is transcribed from DFRobot's official Arduino core
 * UNIHIKER:esp32@0.0.5 — see docs/HARDWARE_PINMAP.md for the exact source
 * file and line of each one. Nothing here is guessed.
 *
 * Do not add a constant to this file that you have not verified against the
 * SDK or measured on hardware.
 */

namespace byte_os::k10 {

// ---- Display: ILI9341 240x320, SPI -------------------------------------
// Source: libraries/TFT_eSPI/User_Setup.h (the active setup)
inline constexpr int8_t  kLcdMosi   = 21;
inline constexpr int8_t  kLcdSclk   = 12;
inline constexpr int8_t  kLcdCs     = 14;
inline constexpr int8_t  kLcdDc     = 13;
inline constexpr int8_t  kLcdRst    = -1;  // not wired; tied to board reset
inline constexpr int8_t  kLcdMiso   = -1;  // not wired
inline constexpr uint32_t kLcdSpiHz = 40000000;

inline constexpr int16_t kScreenWidth  = 240;  // portrait (dir 0 or 2)
inline constexpr int16_t kScreenHeight = 320;

/** The K10 has no digitiser. UI must never assume a pointer. */
inline constexpr bool kHasTouch = false;

// ---- I2C ----------------------------------------------------------------
// Source: variants/unihiker_k10/pins_arduino.h
inline constexpr int8_t kI2cSda = 47;
inline constexpr int8_t kI2cScl = 48;

// ---- I2S audio ----------------------------------------------------------
// Source: libraries/unihiker_k10/src/unihiker_k10.h lines 39-43
inline constexpr int8_t kI2sBclk = 0;
inline constexpr int8_t kI2sLrck = 38;
inline constexpr int8_t kI2sMicDataIn    = 39;
inline constexpr int8_t kI2sSpeakerDataOut = 45;
inline constexpr int8_t kI2sMclk = 3;

// ---- WS2812 -------------------------------------------------------------
inline constexpr int8_t  kRgbPin   = 46;
inline constexpr uint8_t kRgbCount = 3;

// ---- SPI (edge connector / SD; SCK+MOSI shared with display) -----------
inline constexpr int8_t kSpiSck  = 12;
inline constexpr int8_t kSpiMosi = 21;
inline constexpr int8_t kSpiMiso = 41;
inline constexpr int8_t kSpiSs   = 40;

// ---- I2C device addresses ----------------------------------------------
inline constexpr uint8_t kAddrAccelSc7a20h = 0x19;
inline constexpr uint8_t kAddrLightLtr303  = 0x29;
inline constexpr uint8_t kAddrMsa311       = 0x62;

/**
 * XL9535 expander channels.
 *
 * These are NOT ESP32 GPIO numbers. They index the board's I2C GPIO expander
 * and must be driven with the SDK's digital_write(ePin_t, level). The values
 * mirror the ePin_t enum in the SDK's initBoard.h; we reference the SDK enum
 * directly at call sites rather than duplicating its numbering here.
 *
 * Behind the expander: LCD backlight (eLCD_BLK, ACTIVE HIGH), camera reset
 * (eCamera_rst), button A (eP5_KeyA), button B (eP11_KeyB), amplifier gain
 * (eAmp_Gain), and edge-connector IO P2-P4, P6, P8-P10, P12-P15.
 *
 * IMPORTANT: UNIHIKER_K10::begin() leaves eLCD_BLK LOW. The backlight is only
 * raised inside initScreen(). Rendering without initScreen() requires an
 * explicit digital_write(eLCD_BLK, 1). See docs/HARDWARE_PINMAP.md.
 */
inline constexpr bool kBacklightActiveHigh = true;

}  // namespace byte_os::k10
