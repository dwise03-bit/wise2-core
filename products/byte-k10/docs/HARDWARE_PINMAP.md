# UNIHIKER K10 — Verified Hardware Pin Map

**Board:** DFRobot UNIHIKER K10 (DFR0992)
**MCU:** ESP32-S3 (QFN56, rev v0.2), dual-core Xtensa LX7 @ 240 MHz
**RAM:** 512 KB SRAM + 8 MB PSRAM (embedded, AP_3v3)
**Flash:** 16 MB, QIO @ 80 MHz
**USB:** USB-Serial/JTAG (native), VID `0x303A` PID `0x1001`
**Verified MAC (this unit):** `1c:db:d4:aa:68:50`
**Port (this host):** `/dev/cu.usbmodem101`

> Every value below is taken from DFRobot's official Arduino core
> `UNIHIKER:esp32@0.0.5` or read directly off the connected device.
> **Nothing here is inferred or guessed.** Sources are cited per section.

---

## 1. Display — ILI9341, 240 × 320, SPI

Source: `0.0.5/libraries/TFT_eSPI/User_Setup.h` (the active setup;
`User_Setup_Select.h` line 27 includes `<User_Setup.h>`).

| Signal | GPIO | Note |
|---|---|---|
| Driver IC | — | `ILI9341_DRIVER` |
| `TFT_MOSI` | **21** | |
| `TFT_SCLK` | **12** | |
| `TFT_CS` | **14** | |
| `TFT_DC` | **13** | |
| `TFT_RST` | **-1** | Not wired to a GPIO — tied to board reset |
| `TFT_MISO` | **-1** | Not wired |
| Backlight | **XL9535 expander**, channel `eLCD_BLK` | **Not a direct GPIO** |
| SPI write clock | 40 MHz | `SPI_FREQUENCY` |
| SPI read clock | 20 MHz | `SPI_READ_FREQUENCY` |

**Resolution is 240 × 320 (portrait), not 480 × 320.** This is the ILI9341's
native geometry. Orientation: `dir` 0 or 2 → 240×320 portrait;
`dir` 1 or 3 → 320×240 landscape.

### Backlight sequencing — read this before debugging a dark panel

The backlight is **active HIGH** on expander channel `eLCD_BLK`, and
`UNIHIKER_K10::begin()` deliberately leaves it **OFF**:

```cpp
// unihiker_k10.cpp, begin() @ line 326
init_board();
digital_write(eLCD_BLK, 0);  delay(100);
digital_write(eLCD_BLK, 1);  delay(100);
digital_write(eLCD_BLK, 0);   // <-- ends LOW: panel dark after begin()
```

It is turned on inside `initScreen()`:

```cpp
// unihiker_k10.cpp, initScreen() @ line 416
lv_init();
digital_write(eLCD_BLK, 1);   // <-- backlight ON here
```

**Consequence:** calling `begin()` without `initScreen()` gives a powered but
dark display. To render with raw TFT_eSPI instead of the LVGL stack, call
`digital_write(eLCD_BLK, 1)` explicitly after `begin()`.

`initScreen()` allocates a full-screen LVGL draw buffer in PSRAM
(`heap_caps_malloc(240*320*sizeof(lv_color_t), MALLOC_CAP_SPIRAM)`) and
starts an LVGL task that owns the panel.

### No touch panel
`User_Setup.h` sets `TOUCH_CS -1`, and the DFRobot specification page lists no
touchscreen. **The K10 display is output-only.** Confirmed twice, independently.
Input is buttons + accelerometer + microphones (§4).

---

## 2. XL9535 I²C GPIO expander

Source: `0.0.5/tools/.../initBoard.h`, `ePin_t` enum.

Several board functions are **not** on ESP32 GPIOs — they are behind the
XL9535 expander and must be driven over I²C:

| Expander channel | Function |
|---|---|
| `eLCD_BLK` | LCD backlight |
| `eCamera_rst` | Camera reset |
| `eP5_KeyA` | Button A |
| `eP11_KeyB` | Button B |
| `eAmp_Gain` | Audio amplifier gain |
| `eP2`,`eP3`,`eP4`,`eP6`,`eP8`,`eP9`,`eP10`,`eP12`–`eP15` | Edge-connector IO |

The `P3`–`P16` constants in `pins_arduino.h` are marked 扩展IO
(*expansion IO*) — they are **expander indices, not ESP32 GPIO numbers**.
`P5 = 12` (Key A) would otherwise collide with `TFT_SCLK = 12`.
`P0`–`P2` are marked 原生IO (*native IO*) and map to GPIO 1, 2, 3.

---

## 3. I²C bus and sensors

Source: `pins_arduino.h`; addresses from `unihiker_k10.h`.

| Signal | GPIO |
|---|---|
| `SDA` | **47** |
| `SCL` | **48** |

| Device | Address | Function |
|---|---|---|
| SC7A20H | `0x19` | 3-axis accelerometer |
| LTR303ALS | `0x29` | Ambient light (0–64k lux) |
| AHT20 | via `DFRobot_AHT20` | Temperature + humidity |
| MSA311 | `0x62` | Defined in header |
| XL9535 | — | GPIO expander (§2) |

---

## 4. Audio — I²S

Source: `unihiker_k10.h` lines 39–43.

| Signal | GPIO | Direction |
|---|---|---|
| `IIS_BLCK` | **0** | Bit clock |
| `IIS_LRCK` | **38** | Word select |
| `IIS_DSIN` | **39** | **Mic data in** (2× MEMS) |
| `IIS_DOUT` | **45** | **Speaker data out** (2 W) |
| `IIS_MCLK` | **3** | Master clock |

Amplifier gain is on the expander (`eAmp_Gain`).
I²S access is guarded by `xI2SMutex` — playback and capture share the bus.

---

## 5. Camera — GC2145, 2 MP, 80° FOV

Pins are **compiled into the board's prebuilt `who_camera` module**;
`register_camera()` takes no pin arguments:

```c
void register_camera(const pixformat_t pixel_format,
                     const framesize_t frame_size,
                     const uint8_t fb_count,
                     const QueueHandle_t frame_o);
```

The K10 library calls it as
`register_camera(PIXFORMAT_RGB565, FRAMESIZE_QVGA, 2, xQueueCamera)`.
Camera reset is on the expander (`eCamera_rst`).

**There are no camera GPIOs to configure** — use the SDK entry point.

---

## 6. RGB LEDs

Source: `unihiker_k10.h` lines 36–37.

| Item | Value |
|---|---|
| `PIXEL_PIN` | **46** |
| `PIXEL_COUNT` | **3** (WS2812) |

---

## 7. SPI (edge connector / SD)

Source: `pins_arduino.h`.

| Signal | GPIO |
|---|---|
| `SCK` | **12** |
| `MOSI` | **21** |
| `MISO` | **41** |
| `SS` | **40** |

SCK/MOSI are shared with the display.

---

## 8. Power

| Item | Value |
|---|---|
| USB-C | 5 V, power + programming |
| Battery | 2-pin PH2.0, 3.0–6.0 V DC (3.7 V LiPo or 3× AA/AAA) |

---

## 9. Build configuration

Source: `DFRobot/platform-unihiker/boards/unihiker_k10.json`.

| Key | Value |
|---|---|
| MCU | `esp32s3` |
| Variant | `unihiker_k10` |
| Flash | 16 MB, `qio`, 80 MHz |
| Partitions | `large_spiffs_16MB.csv` |
| CPU | 240 MHz |
| Upload speed | 460800 |
| Flags | `-DARDUINO_USB_MODE=1 -DARDUINO_USB_CDC_ON_BOOT=1 -DBOARD_HAS_PSRAM`<br>`-DARDUINO_RUNNING_CORE=1 -DARDUINO_EVENT_RUNNING_CORE=1` |

Dual-core: task pinning to core 0 **and** core 1 is valid (unlike the
single-core ESP32-C5 prototype).

---

## 10. Available SDK libraries

`unihiker_k10` (board API), `TFT_eSPI` (preconfigured), `lvgl`,
`lv_lib_qrcode`, `AIRecognition`, `DFRobot_ESPASR` + `asr` (speech),
`ESP32_IO_Expander`, `ESP32_Display_Panel`, `DFRobot_AHT20`,
`Adafruit_NeoPixel`, `I2S`, `SD`, `WiFi`, `BLE`, `ArduinoOTA`, `HTTPClient`,
`WebServer`, `Preferences`, `SPIFFS`/`LittleFS`.

Board-level gestures are provided by the SDK:
`Shake`, `ScreenUp`, `ScreenDown`, `TiltLeft`, `TiltRight`, `TiltBack`,
`TiltForward`.
