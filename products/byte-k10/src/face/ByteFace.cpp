#include "ByteFace.h"

#include <math.h>

namespace byte_os {

namespace {
constexpr float kPi = 3.14159265f;

inline float clampf(float v, float lo, float hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}
/** Frame-rate independent exponential approach toward `target`. */
inline float approach(float cur, float target, float rate, float dt) {
    const float k = 1.0f - expf(-rate * dt);
    return cur + (target - cur) * k;
}
/** Deterministic pseudo-random in 0..1 from a counter — no Math.random needed. */
inline float hashf(uint32_t n) {
    n = (n ^ 61u) ^ (n >> 16);
    n *= 9u;
    n = n ^ (n >> 4);
    n *= 0x27d4eb2du;
    n = n ^ (n >> 15);
    return static_cast<float>(n & 0xFFFFu) / 65535.0f;
}
}  // namespace

const char* toString(ByteState s) {
    switch (s) {
        case ByteState::Idle:            return "IDLE";
        case ByteState::Happy:           return "HAPPY";
        case ByteState::Talking:         return "SPEAKING";
        case ByteState::Listening:       return "LISTENING";
        case ByteState::Thinking:        return "THINKING";
        case ByteState::Sleeping:        return "SLEEP";
        case ByteState::Charging:        return "CHARGING";
        case ByteState::Error:           return "ALERT";
        case ByteState::Offline:         return "OFFLINE";
        case ByteState::UpdateAvailable: return "UPDATE";
    }
    return "?";
}

ByteFace::ByteFace() { tBlink_ = 2200; }

void ByteFace::setState(ByteState s) {
    if (s == state_) return;
    state_ = s;
    tState_ = 0;
    // A state change is a good moment to re-centre the gaze.
    gazeTargetX_ = gazeTargetY_ = 0.0f;
}

void ByteFace::lookAt(float x, float y) {
    gazeTargetX_ = clampf(x, -1.0f, 1.0f);
    gazeTargetY_ = clampf(y, -1.0f, 1.0f);
}

void ByteFace::blink() {
    if (blinkMs_ == 0) blinkMs_ = 140;
}

void ByteFace::setSpeechLevel(float level) { speech_ = clampf(level, 0.0f, 1.0f); }

Color ByteFace::accent() const {
    switch (state_) {
        case ByteState::Error:           return theme::Danger;
        case ByteState::Offline:         return theme::TextMuted;
        case ByteState::Charging:        return theme::Success;
        case ByteState::UpdateAvailable: return theme::Warning;
        case ByteState::Sleeping:        return theme::AccentDim;
        default:                         return theme::Accent;
    }
}

void ByteFace::update(uint32_t dtMs) {
    const float dt = dtMs / 1000.0f;
    tAnim_  += dtMs;
    tState_ += dtMs;

    // ---- Blink -----------------------------------------------------------
    if (blinkMs_ > 0) {
        blinkMs_ = (blinkMs_ > dtMs) ? blinkMs_ - dtMs : 0;
    } else if (state_ != ByteState::Sleeping) {
        if (tBlink_ > dtMs) {
            tBlink_ -= dtMs;
        } else {
            blink();
            // Next blink 1.8-5.2s away; deterministic but irregular.
            tBlink_ = 1800 + static_cast<uint32_t>(hashf(tAnim_) * 3400.0f);
        }
    }

    // Eye aperture target: closed mid-blink, narrow when sleeping/thinking.
    float openTarget = 1.0f;
    if (blinkMs_ > 0)                        openTarget = 0.06f;
    else if (state_ == ByteState::Sleeping)  openTarget = 0.10f;
    else if (state_ == ByteState::Thinking)  openTarget = 0.70f;
    else if (state_ == ByteState::Happy)     openTarget = 0.85f;
    eyeOpen_ = approach(eyeOpen_, openTarget, 22.0f, dt);

    // ---- Per-state idle motion -------------------------------------------
    const float t = tAnim_ / 1000.0f;

    switch (state_) {
        case ByteState::Idle:
            bounce_ = sinf(t * 1.6f) * 2.5f;
            tilt_   = sinf(t * 0.7f) * 0.12f;
            if (fmodf(t, 3.5f) < 0.02f) {
                lookAt((hashf(tAnim_) - 0.5f) * 1.2f, (hashf(tAnim_ + 7u) - 0.5f) * 0.6f);
            }
            break;

        case ByteState::Happy:
            bounce_ = fabsf(sinf(t * 5.0f)) * -6.0f;
            tilt_   = sinf(t * 3.0f) * 0.18f;
            break;

        case ByteState::Talking:
            bounce_ = sinf(t * 3.0f) * 1.5f;
            tilt_   = sinf(t * 1.3f) * 0.08f;
            break;

        case ByteState::Listening:
            bounce_ = sinf(t * 1.2f) * 1.5f;
            tilt_   = 0.22f;                       // head cocked, attentive
            break;

        case ByteState::Thinking:
            bounce_ = 0.0f;
            tilt_   = sinf(t * 0.9f) * 0.25f;
            lookAt(sinf(t * 1.1f) * 0.8f, -0.45f); // glancing upward
            break;

        case ByteState::Sleeping:
            bounce_ = sinf(t * 0.8f) * 3.5f;       // slow breathing
            tilt_   = 0.30f;
            break;

        case ByteState::Charging:
            bounce_ = sinf(t * 2.2f) * 2.0f;
            tilt_   = 0.0f;
            break;

        case ByteState::Error:
            bounce_ = sinf(t * 22.0f) * 2.0f;      // agitated shiver
            tilt_   = sinf(t * 18.0f) * 0.10f;
            break;

        case ByteState::Offline:
            bounce_ = 0.0f;
            tilt_   = -0.15f;
            break;

        case ByteState::UpdateAvailable:
            bounce_ = sinf(t * 2.0f) * 2.0f;
            tilt_   = 0.0f;
            break;
    }

    // Notification pulse rides on top for states that want attention.
    const bool wantsPulse = (state_ == ByteState::UpdateAvailable ||
                             state_ == ByteState::Error);
    pulse_ = wantsPulse ? (0.5f + 0.5f * sinf(t * 4.0f)) : 0.0f;

    // ---- Gaze ------------------------------------------------------------
    gazeX_ = approach(gazeX_, gazeTargetX_, 6.0f, dt);
    gazeY_ = approach(gazeY_, gazeTargetY_, 6.0f, dt);
    // Idle gaze drifts back to centre so BYTE doesn't stare off-screen.
    gazeTargetX_ = approach(gazeTargetX_, 0.0f, 0.5f, dt);
    gazeTargetY_ = approach(gazeTargetY_, 0.0f, 0.5f, dt);

    // ---- Mouth -----------------------------------------------------------
    float mouthTarget = 0.0f;
    switch (state_) {
        case ByteState::Talking:
            // Prefer real audio level; fall back to a natural-looking cadence.
            mouthTarget = (speech_ > 0.01f)
                ? speech_
                : 0.5f + 0.5f * sinf(t * 11.0f) * fabsf(sinf(t * 3.1f));
            break;
        case ByteState::Happy:     mouthTarget = 0.75f; break;
        case ByteState::Listening: mouthTarget = 0.15f; break;
        case ByteState::Sleeping:  mouthTarget = 0.10f; break;
        default:                   mouthTarget = 0.0f;  break;
    }
    mouthOpen_ = approach(mouthOpen_, clampf(mouthTarget, 0.0f, 1.0f), 18.0f, dt);
}

void ByteFace::drawEyes(DisplayManager& d, int16_t cx, int16_t cy) {
    const Color c = accent();

    constexpr int16_t kEyeDx = 38;   // horizontal separation from centre
    constexpr int16_t kEyeRx = 20;   // eye half-width
    constexpr int16_t kEyeRyMax = 26;

    const int16_t gx = static_cast<int16_t>(gazeX_ * 7.0f);
    const int16_t gy = static_cast<int16_t>(gazeY_ * 5.0f);
    const int16_t ry = static_cast<int16_t>(kEyeRyMax * clampf(eyeOpen_, 0.05f, 1.0f));

    for (int i = 0; i < 2; ++i) {
        const int16_t sign = (i == 0) ? -1 : 1;
        // Tilt rotates the eye pair about the face centre (small-angle approx).
        const int16_t ex = cx + sign * kEyeDx + gx;
        const int16_t ey = cy + gy + static_cast<int16_t>(sign * tilt_ * 10.0f);

        if (state_ == ByteState::Sleeping || eyeOpen_ < 0.12f) {
            // Closed: a simple bar reads far better than a squashed ellipse.
            d.fillRoundRect(ex - kEyeRx, ey - 3, kEyeRx * 2, 6, 3, c);
        } else {
            d.fillEllipse(ex, ey, kEyeRx, ry, c);
            // Specular highlight gives the eye depth.
            d.fillCircle(ex - kEyeRx / 3, ey - ry / 2, 4, theme::ChromeBright);
        }
    }

    // Error state gets angled brows; unmistakable at a glance.
    if (state_ == ByteState::Error) {
        d.drawLine(cx - kEyeDx - 18, cy - 34, cx - kEyeDx + 18, cy - 22, c);
        d.drawLine(cx + kEyeDx + 18, cy - 34, cx + kEyeDx - 18, cy - 22, c);
    }
}

void ByteFace::drawMouth(DisplayManager& d, int16_t cx, int16_t cy) {
    const Color c = accent();
    const int16_t my = cy + 52;

    if (state_ == ByteState::Happy) {
        // Upward arc built from short chords.
        for (int i = -22; i < 22; ++i) {
            const float u = i / 22.0f;
            const int16_t y0 = my + static_cast<int16_t>(10.0f * (u * u) - 6.0f);
            d.fillRect(cx + i, y0, 2, 4, c);
        }
        return;
    }

    const int16_t h = static_cast<int16_t>(4 + mouthOpen_ * 26.0f);
    const int16_t w = 34;
    d.fillRoundRect(cx - w / 2, my - h / 2, w, h, h / 2 > 3 ? 6 : 2, c);
}

void ByteFace::draw(DisplayManager& d, int16_t cx, int16_t cy) {
    const int16_t y = cy + static_cast<int16_t>(bounce_);

    // Notification halo behind the face.
    if (pulse_ > 0.01f) {
        const int16_t r = static_cast<int16_t>(96 + pulse_ * 10.0f);
        d.drawCircle(cx, y, r, theme::AccentAlt);
        d.drawCircle(cx, y, r - 1, accent());
    }

    drawEyes(d, cx, y);
    drawMouth(d, cx, y);

    // Sleeping gets drifting "z"s so the state is legible without text.
    if (state_ == ByteState::Sleeping) {
        const float t = tAnim_ / 1000.0f;
        for (int i = 0; i < 3; ++i) {
            const float ph = fmodf(t * 0.5f + i * 0.33f, 1.0f);
            const int16_t zx = cx + 60 + static_cast<int16_t>(ph * 22.0f);
            const int16_t zy = y - 40 - static_cast<int16_t>(ph * 40.0f);
            d.setTextSize(ph < 0.5f ? 2 : 1);
            d.setTextColor(theme::AccentAlt);
            d.drawText("z", zx, zy);
        }
    }
}

}  // namespace byte_os
