#pragma once

#include <stdint.h>

#include "../display/DisplayManager.h"

namespace byte_os {

/** BYTE's emotional/system states. */
enum class ByteState : uint8_t {
    Idle = 0,
    Happy,
    Talking,
    Listening,
    Thinking,
    Sleeping,
    Charging,
    Error,
    Offline,
    UpdateAvailable,
};

const char* toString(ByteState s);

/**
 * The BYTE character.
 *
 * Animation is driven by update(dtMs) using real elapsed time, and rendering
 * is a pure function of the resulting state in draw(). Frame rate therefore
 * never changes animation speed — a dropped frame shows the same motion, just
 * sampled less often.
 *
 * All geometry is expressed relative to a centre point and a scale, so the
 * same character renders correctly on a different panel size.
 */
class ByteFace {
public:
    ByteFace();

    void setState(ByteState s);
    ByteState state() const { return state_; }

    /** Nudge BYTE's gaze; x/y in -1.0..1.0. Decays back to centre. */
    void lookAt(float x, float y);

    /** Trigger a one-off blink now (also happens spontaneously). */
    void blink();

    /** Drive the mouth from live audio level, 0.0..1.0 (Talking state). */
    void setSpeechLevel(float level);

    /** Advance animation by real elapsed milliseconds. */
    void update(uint32_t dtMs);

    /** Render centred at (cx, cy). Does not clear the background. */
    void draw(DisplayManager& d, int16_t cx, int16_t cy);

private:
    ByteState state_ = ByteState::Idle;

    // Time bases (ms) — separate so they never fight each other.
    uint32_t tState_  = 0;   // since last state change
    uint32_t tBlink_  = 0;   // until next spontaneous blink
    uint32_t tAnim_   = 0;   // free-running, drives idle motion
    uint32_t blinkMs_ = 0;   // remaining blink duration, 0 = eyes open

    // Continuous animated quantities.
    float eyeOpen_    = 1.0f;   // 0 closed .. 1 open
    float gazeX_ = 0.0f, gazeY_ = 0.0f;
    float gazeTargetX_ = 0.0f, gazeTargetY_ = 0.0f;
    float bounce_     = 0.0f;   // vertical offset in px
    float tilt_       = 0.0f;   // head tilt, -1..1
    float mouthOpen_  = 0.0f;   // 0 closed .. 1 open
    float speech_     = 0.0f;   // externally supplied level
    float pulse_      = 0.0f;   // notification pulse 0..1

    Color accent() const;
    void drawEyes(DisplayManager& d, int16_t cx, int16_t cy);
    void drawMouth(DisplayManager& d, int16_t cx, int16_t cy);
};

}  // namespace byte_os
