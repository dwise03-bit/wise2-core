#include "InputManager_K10.h"

#include <Arduino.h>
#include <stdlib.h>
#include "unihiker_k10.h"

namespace byte_os {

const char* toString(InputEvent e) {
    switch (e) {
        case InputEvent::None:           return "None";
        case InputEvent::SelectPress:    return "Select";
        case InputEvent::SelectLongPress:return "SelectLong";
        case InputEvent::BackPress:      return "Back";
        case InputEvent::BackLongPress:  return "BackLong";
        case InputEvent::MenuPress:      return "Menu";
        case InputEvent::DoublePress:    return "Double";
        case InputEvent::NavUp:          return "NavUp";
        case InputEvent::NavDown:        return "NavDown";
        case InputEvent::NavLeft:        return "NavLeft";
        case InputEvent::NavRight:       return "NavRight";
        case InputEvent::Shake:          return "Shake";
        case InputEvent::FaceUp:         return "FaceUp";
        case InputEvent::FaceDown:       return "FaceDown";
    }
    return "?";
}

namespace {
// Latched by the SDK's button task; consumed by poll() on the render core.
volatile bool  gADown = false, gBDown = false;
volatile bool  gAEdge = false, gBEdge = false;

// The SC7A20H is read as 12-BIT SIGNED by the SDK's gesture_task:
//     accX = (buf[1]<<8 | buf[0]) >> 4;  if (accX & 0x800) accX -= 4096;
// so the full range is -2048..+2047, i.e. ~1024 counts per g. At rest one
// axis sits near +/-1024 (gravity) and the others near 0.
//
// The first version of this file used 4500/2500/22000, all beyond the
// sensor's maximum possible reading, so tilt could never fire. Measure the
// hardware; do not guess the scale.
constexpr int   kTiltOn      = 460;    // stronger deliberate lean
constexpr int   kTiltOff     = 260;    // wider dead zone before re-arming
constexpr int   kShakeLevel  = 2600;   // vs ~1024 sum at rest
constexpr float kAccelFilter = 0.18f;  // low-pass; suppress hand jitter
constexpr int   kAxisLead    = 140;    // dominant axis must clearly win
// K10 tilt is intentionally one-gesture-per-lean. Repeats sounded good on
// paper but, on real hardware, slow drift and hand tremor turned them into
// runaway navigation.
constexpr uint32_t kShakeGapMs    = 600;
constexpr uint8_t  kNeutralSamplesToRearm = 6;
constexpr uint8_t  kConfirmSamples        = 2;
// Baseline is only accepted after this many consecutive near-identical
// samples (at 50ms each), i.e. the board has genuinely stopped moving.
constexpr int      kStillTol      = 35;
constexpr uint8_t  kStillSamples  = 8;
constexpr uint32_t kLongPressMs = 600;
}  // namespace

void InputManager_K10::onButtonADown() { gADown = true;  gAEdge = true; }
void InputManager_K10::onButtonAUp()   { gADown = false; }
void InputManager_K10::onButtonBDown() { gBDown = true;  gBEdge = true; }
void InputManager_K10::onButtonBUp()   { gBDown = false; }

InputManager_K10::InputManager_K10(UNIHIKER_K10& board) : board_(board) {}

void InputManager_K10::recalibrate() {
    calibrated_   = false;
    calibSamples_ = 0;
    lastNav_      = InputEvent::None;
    repeating_    = false;
    neutralSamples_ = 0;
    wantSamples_ = 0;
    wantLatched_ = InputEvent::None;
    armed_ = true;
    Serial.println("[INPUT] recalibrating tilt - hold the board still");
    Serial.flush();
}

Status InputManager_K10::initialize() {
    if (!board_.buttonA || !board_.buttonB) {
        return Status::error("SDK buttons not constructed");
    }
    board_.buttonA->setPressedCallback(&InputManager_K10::onButtonADown);
    board_.buttonA->setUnPressedCallback(&InputManager_K10::onButtonAUp);
    board_.buttonB->setPressedCallback(&InputManager_K10::onButtonBDown);
    board_.buttonB->setUnPressedCallback(&InputManager_K10::onButtonBUp);

    lastActivityMs_ = millis();
    return Status::pass("buttons + SC7A20H tilt");
}

void InputManager_K10::acceleration(int& x, int& y, int& z) const {
    x = ax_; y = ay_; z = az_;
}

uint32_t InputManager_K10::idleMs() const {
    const uint32_t now = millis();
    return now >= lastActivityMs_ ? now - lastActivityMs_ : 0;
}

bool InputManager_K10::isHeld(InputSource button) const {
    switch (button) {
        case InputSource::ButtonA:  return gADown;
        case InputSource::ButtonB:  return gBDown;
        case InputSource::ButtonAB: return gADown && gBDown;
        default: return false;
    }
}

InputReport InputManager_K10::classifyTilt(uint32_t now) {
    InputReport r;

    // Tilt is measured RELATIVE to however the board is resting. Measured on
    // this unit, "flat on a desk" was actually (-5, -265, -837): absolute
    // thresholds would therefore behave differently depending on whether the
    // K10 sits flat, propped in a stand, or is held in the hand.
    const int fx = static_cast<int>(filtX_);
    const int fy = static_cast<int>(filtY_);
    const int fz = static_cast<int>(filtZ_);
    const int dx = fx - baseX_;
    const int dy = fy - baseY_;

    const int mag = abs(fx) + abs(fy) + abs(fz);
    if (mag > kShakeLevel) {
        neutralSamples_ = 0;
        wantSamples_ = 0;
        wantLatched_ = InputEvent::None;
        if (now - lastNavMs_ >= kShakeGapMs) {
            lastNavMs_ = now;
            r.event = InputEvent::Shake;
            r.source = InputSource::Accelerometer;
            r.timestampMs = now;
        }
        return r;
    }

    // Dominant axis wins, so a diagonal lean does not fire two directions.
    InputEvent want = InputEvent::None;
    if (abs(dx) > abs(dy) + kAxisLead) {
        if (dx >  kTiltOn) want = InputEvent::NavRight;
        else if (dx < -kTiltOn) want = InputEvent::NavLeft;
    } else if (abs(dy) > abs(dx) + kAxisLead) {
        if (dy >  kTiltOn) want = InputEvent::NavDown;
        else if (dy < -kTiltOn) want = InputEvent::NavUp;
    }

    // Back in the dead zone: re-arm only after several consecutive quiet
    // samples. A single noisy sample near level was enough to re-arm the old
    // logic, which let a resting board machine-gun NavDown events.
    if (abs(dx) < kTiltOff && abs(dy) < kTiltOff) {
        wantSamples_ = 0;
        wantLatched_ = InputEvent::None;
        if (neutralSamples_ < kNeutralSamplesToRearm) ++neutralSamples_;
        if (neutralSamples_ >= kNeutralSamplesToRearm) {
            armed_     = true;
            lastNav_   = InputEvent::None;
            repeating_ = false;
        }
        return r;
    }

    neutralSamples_ = 0;
    if (want == InputEvent::None) return r;   // between the two thresholds

    if (armed_) {
        if (want != wantLatched_) {
            wantLatched_ = want;
            wantSamples_ = 1;
            return r;
        }
        if (wantSamples_ < kConfirmSamples) {
            ++wantSamples_;
            return r;
        }
        armed_       = false;                 // consumed; needs neutral to re-arm
        lastNav_     = want;
        navHeldFrom_ = now;
        lastNavMs_   = now;
        repeating_   = false;
        wantSamples_ = 0;
        wantLatched_ = InputEvent::None;
        r.event      = want;
        r.source     = InputSource::Accelerometer;
        r.timestampMs = now;
        return r;
    }

    // Not armed. No repeat: after one gesture the board must pass back
    // through neutral before another move is accepted.
    if (want != lastNav_) {
        wantLatched_ = want;
        wantSamples_ = 0;
    }
    return r;
}

InputReport InputManager_K10::poll() {
    const uint32_t now = millis();
    InputReport r;

    // ---- Buttons (already event-latched; no I2C here) --------------------
    if (gAEdge) {
        gAEdge = false;
        aDownMs_ = now;
        aReported_ = false;
        lastActivityMs_ = now;
    }
    if (gBEdge) {
        gBEdge = false;
        bDownMs_ = now;
        bReported_ = false;
        lastActivityMs_ = now;
    }

    // A+B chord takes precedence over either alone.
    if (gADown && gBDown && !aReported_ && !bReported_) {
        aReported_ = bReported_ = true;
        r.event = InputEvent::MenuPress;
        r.source = InputSource::ButtonAB;
        r.timestampMs = now;
        return r;
    }

    // Long press fires while still held; short press fires on release.
    if (gADown && !aReported_ && (now - aDownMs_) >= kLongPressMs) {
        aReported_ = true;
        r.event = InputEvent::SelectLongPress;
        r.source = InputSource::ButtonA;
        r.durationMs = static_cast<uint16_t>(now - aDownMs_);
        r.timestampMs = now;
        return r;
    }
    if (!gADown && aDownMs_ && !aReported_) {
        aReported_ = true;
        r.event = InputEvent::SelectPress;
        r.source = InputSource::ButtonA;
        r.durationMs = static_cast<uint16_t>(now - aDownMs_);
        r.timestampMs = now;
        return r;
    }

    if (gBDown && !bReported_ && (now - bDownMs_) >= kLongPressMs) {
        bReported_ = true;
        r.event = InputEvent::BackLongPress;
        r.source = InputSource::ButtonB;
        r.durationMs = static_cast<uint16_t>(now - bDownMs_);
        r.timestampMs = now;
        return r;
    }
    if (!gBDown && bDownMs_ && !bReported_) {
        bReported_ = true;
        r.event = InputEvent::BackPress;
        r.source = InputSource::ButtonB;
        r.durationMs = static_cast<uint16_t>(now - bDownMs_);
        r.timestampMs = now;
        return r;
    }

    // ---- Accelerometer (I2C: sampled at ~20Hz, never per-frame) ----------
    if (now - lastAccelMs_ >= 50) {
        lastAccelMs_ = now;
        ax_ = board_.getAccelerometerX();
        ay_ = board_.getAccelerometerY();
        az_ = board_.getAccelerometerZ();
        if (!calibrated_ && filtX_ == 0.0f && filtY_ == 0.0f && filtZ_ == 0.0f) {
            filtX_ = static_cast<float>(ax_);
            filtY_ = static_cast<float>(ay_);
            filtZ_ = static_cast<float>(az_);
        } else {
            filtX_ += (static_cast<float>(ax_) - filtX_) * kAccelFilter;
            filtY_ += (static_cast<float>(ay_) - filtY_) * kAccelFilter;
            filtZ_ += (static_cast<float>(az_) - filtZ_) * kAccelFilter;
        }

        // Establish the resting baseline, but ONLY from samples taken while
        // the board is actually still. Taking the first few samples was wrong:
        // if the user happens to be holding the board at boot, a tilted pose
        // gets learned as "level" and every gesture is skewed thereafter.
        // Zeros are also rejected — the SDK's gesture task reports 0,0,0 until
        // it has polled the sensor at least once.
        if (!calibrated_) {
            const int fx = static_cast<int>(filtX_);
            const int fy = static_cast<int>(filtY_);
            const int fz = static_cast<int>(filtZ_);
            const bool nonZero = (fx || fy || fz);
            const bool still   = nonZero &&
                                 abs(fx - prevX_) < kStillTol &&
                                 abs(fy - prevY_) < kStillTol &&
                                 abs(fz - prevZ_) < kStillTol;
            prevX_ = fx; prevY_ = fy; prevZ_ = fz;

            if (still) {
                if (++calibSamples_ >= kStillSamples) {
                    baseX_ = fx;
                    baseY_ = fy;
                    calibrated_ = true;
                    Serial.printf("[INPUT] tilt baseline %d,%d (settled)\n",
                                  baseX_, baseY_);
                }
            } else {
                calibSamples_ = 0;      // movement restarts the count
            }
            return r;      // no gestures until we know what "level" means
        }

        InputReport tilt = classifyTilt(now);
        if (tilt) {
            lastActivityMs_ = now;
            return tilt;
        }
    }

    return r;
}

}  // namespace byte_os
