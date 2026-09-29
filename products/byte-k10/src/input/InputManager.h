#pragma once

#include <stdint.h>

#include "../core/Status.h"

namespace byte_os {

/**
 * Logical input events.
 *
 * The UNIHIKER K10 has NO touch panel (verified: TFT_eSPI `TOUCH_CS -1`, and
 * DFRobot's specification lists no digitiser). These events are therefore
 * produced from real hardware that the board does have:
 *
 *   - Button A / B / A+B  (XL9535 expander channels eP5_KeyA / eP11_KeyB)
 *   - SC7A20H accelerometer tilt & shake
 *
 * Applications consume this enum and never ask how the event was produced, so
 * a future touch-equipped board can feed the same stream unchanged.
 */
enum class InputEvent : uint8_t {
    None = 0,

    // Discrete button semantics
    SelectPress,       // A tapped
    SelectLongPress,   // A held
    BackPress,         // B tapped
    BackLongPress,     // B held
    MenuPress,         // A+B chord
    DoublePress,       // A double-tapped

    // Navigation, from tilt (analogue of swipe)
    NavUp,
    NavDown,
    NavLeft,
    NavRight,

    // Whole-device motion
    Shake,
    FaceUp,
    FaceDown,
};

const char* toString(InputEvent e);

/** Which physical control produced an event — for diagnostics only. */
enum class InputSource : uint8_t { None, ButtonA, ButtonB, ButtonAB, Accelerometer };

struct InputReport {
    InputEvent  event  = InputEvent::None;
    InputSource source = InputSource::None;
    uint32_t    timestampMs = 0;
    /** Hold duration for long-press events, else 0. */
    uint16_t    durationMs = 0;

    explicit operator bool() const { return event != InputEvent::None; }
};

/**
 * Gesture recognition lives here, never in application code.
 *
 * `poll()` is called once per frame by the kernel; it debounces buttons,
 * classifies press duration, and converts sustained accelerometer tilt into
 * discrete navigation events with hysteresis so a held tilt does not
 * machine-gun repeats.
 */
class InputManager {
public:
    virtual ~InputManager() = default;

    InputManager(const InputManager&) = delete;
    InputManager& operator=(const InputManager&) = delete;

    virtual Status initialize() = 0;

    /** Sample hardware and return at most one event per call. */
    virtual InputReport poll() = 0;

    /** True while the named button is physically down. */
    virtual bool isHeld(InputSource button) const = 0;

    /** Raw accelerometer, in device units, for apps that want the analogue value. */
    virtual void acceleration(int& x, int& y, int& z) const = 0;

    /** Milliseconds since the last input of any kind — drives sleep timeout. */
    virtual uint32_t idleMs() const = 0;

    /**
     * Whether this backend can produce touch-style continuous coordinates.
     * False on K10; UI must not depend on a cursor.
     */
    virtual bool hasPointer() const { return false; }

protected:
    InputManager() = default;
};

}  // namespace byte_os
