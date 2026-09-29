# WISE² BYTE MINI 4.0 — UNIHIKER K10 Architecture

Target: **DFRobot UNIHIKER K10** (ESP32-S3, 8 MB PSRAM, 16 MB flash).
Pin map and its sources: [HARDWARE_PINMAP.md](HARDWARE_PINMAP.md).

---

## Build

```bash
./build.sh            # compile
./build.sh flash      # compile + upload
./build.sh monitor    # compile + upload + serial
```

Two build settings are **mandatory** and easy to lose:

| Setting | Why |
|---|---|
| `CDCOnBoot=cdc` | The K10 exposes **no hardware UART** (`TX = -1`, `RX = -1`). Without this, `Serial` output goes nowhere and the board looks dead. |
| TFT config via `-D` flags | A stock `TFT_eSPI` in `~/Documents/Arduino/libraries` **overrides** the vendor's correct copy (Arduino gives user libraries priority). Defining `USER_SETUP_LOADED=1` plus the pins on the command line makes both `User_Setup.h` files irrelevant, and lets us raise SPI to 80 MHz. |

---

## Threading

The ESP32-S3 is dual-core, and the split is load-bearing:

| Core | Runs |
|---|---|
| **0** | `renderTask` (priority 3) — the entire frame loop |
| **1** | Arduino `loop()` (telemetry only) + the SDK's button ×3, gesture and AHT20 tasks, all at **priority 5** |

The SDK's tasks preempt anything below priority 5 on core 1. Profiling showed
them consuming **~23 ms of every 49 ms frame**. Moving rendering to the idle
core recovered most of it. **Do not move rendering back to core 1.**

### Frame budget (measured, 80 MHz SPI, internal-SRAM buffer)

```
update    0.09 ms      animation + app logic
draw      5.4  ms      all drawing into the back buffer
present  20.6  ms      SPI blit of 240x320x16 = 150 KB
yield     1.0  ms
--------------------
total    27.1 ms  ->  ~37 FPS with the face alone, ~28 FPS with the Dashboard
```

`present` is 76% of the budget and is bounded by SPI bandwidth. The remaining
optimisation is **dirty-rectangle updates** — pushing only changed regions
would cut it to roughly a third.

---

## Layers

```
byte-k10.ino          wiring: construct, register apps, start render task
   |
Kernel                frame loop, app stack, idle staging
   |-- DisplayManager      abstract; DisplayManager_K10 = TFT_eSPI + sprite
   |-- InputManager        abstract; InputManager_K10  = buttons + tilt
   |-- ByteFace            character: 10 states, animation decoupled from render
   `-- Application[]       dashboard, launcher, settings, camera, voice,
                           sysinfo, diagnostics
```

Applications never touch hardware. They receive a `DisplayManager&` to draw
with and `InputReport`s to react to, both interfaces. Porting to another panel
means implementing the pure-virtual primitives in a new `DisplayManager`
backend; the widget helpers and every app come along unchanged.

### Status reporting

`Status` carries `Pass / Warning / Error / **Unavailable**`. The fourth state
is the important one: it means the hardware genuinely is not present, and is
always preferred to inventing a plausible value. Live examples:

- Battery reads **n/a** — the K10 has a battery connector but no documented
  sense ADC.
- microSD reports **N/A (no card)**, not a failure.
- Touch reports **unavailable** — this board has no digitiser.

---

## Input — there is no touchscreen

Verified twice: DFRobot's specification lists no digitiser, and their
`User_Setup.h` sets `TOUCH_CS -1`.

`InputManager` keeps a touch-shaped vocabulary (`SelectPress`, `NavUp`,
`Shake`, …) but produces it from hardware that exists:

| Event | Source |
|---|---|
| `SelectPress` / `SelectLongPress` | Button A (XL9535 expander) |
| `BackPress` / `BackLongPress` | Button B |
| `MenuPress` | A + B chord |
| `NavUp/Down/Left/Right` | SC7A20H tilt |
| `Shake` | SC7A20H magnitude |

Apps never learn which produced an event, so a future touch board feeds the
same stream unchanged.

### Tilt rules learned the hard way

1. **The sensor is 12-bit signed** (`-2048..+2047`, ~1024 counts/g). An initial
   threshold of `4500` exceeded full scale, so tilt could never fire.
2. **Tilt is relative to the resting orientation.** A board "flat on a desk"
   measured `(-5, -265, -837)`. The baseline is learned at boot, and only from
   samples taken while the board is genuinely **still** — calibrating mid-motion
   teaches a tilted pose as level. A+B re-calibrates.
3. **One move per tilt.** Nothing fires again until the board returns through
   the neutral zone. Holding for 1.1 s then auto-repeats at ~2/s. The dominant
   axis is recomputed each sample, so on a diagonal lean the winner flips —
   treating each flip as a fresh gesture fired on every sample and made
   navigation run away.

---

## I²C is the scarce resource

Buttons, all three sensors and the expander share one bus, and the SDK polls it
from priority-5 tasks. Two measured consequences:

- Calling `isPressed()` per frame cost **~10 ms/frame**. Buttons are now
  consumed as **events** via `setPressedCallback`.
- Sensor reads never happen in `draw()`. The Dashboard refreshes at 2 Hz in
  `update()`; `InputManager` samples the accelerometer at 20 Hz.

---

## Known vendor bugs worked around

**`UNIHIKER_K10::readALS()` divides by zero.**

```cpp
uint16_t _als_ch1 = 0, _als_ch0 = 0;
_ratio = _als_ch1 / (_als_ch0 + _als_ch1);   // integer division
```

In darkness both channels read 0 → **IntegerDivideByZero → panic and reboot**.
Even in light, integer division makes `_ratio` always 0, so the lux formula
permanently takes its first branch. `DashboardApp::readLuxSafe()` reads the
same registers via the public `readData()` and does the arithmetic in floating
point with a zero guard.

**Camera geometry is not what the enum implies.** `FRAMESIZE_QVGA` delivers
**240×320 portrait** RGB565 (`len 153600`), already rotated to match the panel
— not 320×240 landscape. Assuming the latter silently rejected every frame.

**The backlight is on the expander and starts off.** `begin()` deliberately
leaves `eLCD_BLK` LOW; only `initScreen()` raises it. Rendering without the
LVGL stack requires an explicit `digital_write(eLCD_BLK, 1)`.

---

## Idle behaviour

Two stages, because a single blank stage is indistinguishable from a crash:

| Idle | Behaviour |
|---|---|
| 60 s (configurable) | BYTE drifts into the Sleeping animation. **Screen stays lit.** |
| 600 s (configurable) | Backlight off, rendering suspended entirely. |
| any input | Wakes. The waking input is consumed, so nothing fires on a screen you could not see. |

---

## Adding an application

1. Subclass `Application`; implement `id()`, `title()`, `draw()`.
2. Override `update()`, `onInput()`, `onEnter()/onExit()`, `health()` as needed.
3. Register it in `setup()`. **It appears in the launcher automatically** —
   the launcher enumerates the kernel's registry — with a health dot from your
   `health()`.

Keep logic in `update()` and drawing in `draw()`. They are separate so
animation timing stays independent of frame rate, and so a dropped frame
changes nothing about motion.

---

## Verification discipline

Everything above was confirmed on the physical board, because on this project
build success repeatedly meant nothing:

- The display "worked" in logs for hours while the panel showed a stale image.
- `tft.width()` returned a correct 240×320 while pixels went to wrong GPIOs.
- Camera frames arrived correctly and were silently discarded.

Two habits that actually found bugs: **log what the hardware returned**
(not what it should return), and **boot straight into the app under test**
rather than coordinating navigation while watching serial.
