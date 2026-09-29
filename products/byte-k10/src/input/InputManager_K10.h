#pragma once

#include "InputManager.h"

class UNIHIKER_K10;

namespace byte_os {

/**
 * K10 input backend.
 *
 * The K10 has no touch panel, so the gesture vocabulary in InputManager is
 * produced from the hardware that does exist:
 *
 *   Button A / B   XL9535 expander, consumed as EVENTS via the SDK's
 *                  setPressedCallback. They are never polled from the render
 *                  path: each isPressed() is an I2C round-trip that contends
 *                  with the SDK's own button tasks and measured ~10ms.
 *   SC7A20H        Tilt supplies NavUp/Down/Left/Right; shake supplies Shake.
 *                  Accelerometer reads are also I2C, so they are sampled at
 *                  ~20Hz rather than per-frame.
 *
 * Tilt uses hysteresis plus a repeat delay so a held tilt scrolls at a
 * readable rate instead of machine-gunning.
 */
class InputManager_K10 final : public InputManager {
public:
    explicit InputManager_K10(UNIHIKER_K10& board);

    Status initialize() override;
    InputReport poll() override;
    bool isHeld(InputSource button) const override;
    void acceleration(int& x, int& y, int& z) const override;
    uint32_t idleMs() const override;
    bool hasPointer() const override { return false; }

    /**
     * Re-learn the resting orientation. Call when the board has been set down
     * in a new position; it takes effect once the board is still.
     */
    void recalibrate();

    /** Called from the SDK's button task context. */
    static void onButtonADown();
    static void onButtonAUp();
    static void onButtonBDown();
    static void onButtonBUp();

private:
    UNIHIKER_K10& board_;

    int  ax_ = 0, ay_ = 0, az_ = 0;
    float filtX_ = 0.0f, filtY_ = 0.0f, filtZ_ = 0.0f;
    uint32_t lastAccelMs_ = 0;
    uint32_t lastActivityMs_ = 0;
    uint32_t lastNavMs_ = 0;
    InputEvent lastNav_ = InputEvent::None;

    // Resting orientation, captured at startup; tilt is measured from this.
    int      baseX_ = 0, baseY_ = 0;
    bool     calibrated_ = false;
    uint32_t navHeldFrom_ = 0;
    bool     repeating_ = false;
    bool     armed_ = true;   // must pass through neutral to re-arm
    uint8_t  calibSamples_ = 0;
    uint8_t  neutralSamples_ = 0;
    uint8_t  wantSamples_ = 0;
    int      prevX_ = 0, prevY_ = 0, prevZ_ = 0;
    InputEvent wantLatched_ = InputEvent::None;

    // Press-duration tracking for long-press classification.
    uint32_t aDownMs_ = 0, bDownMs_ = 0;
    bool     aReported_ = false, bReported_ = false;

    InputReport classifyTilt(uint32_t now);
};

}  // namespace byte_os
