/*!
 * WISE² IMP FACE ENGINE
 *
 * Professional animated face rendering for UNIHIKER K10
 * Angular electric-blue eyes with 12 emotional states
 * Smooth blinking and micro-animations
 */

#ifndef WISE2_FACE_ENGINE_H
#define WISE2_FACE_ENGINE_H

#include <stdint.h>

// ============================================================
// FACE STATE ENUM - 12 EMOTIONAL STATES
// ============================================================

enum class ImpFaceState {
    BOOT = 0,           // Boot animation
    IDLE = 1,           // Ready, confident, watching
    LISTENING = 2,      // Attentive, sound waves
    THINKING = 3,       // Processing, thought dots
    SPEAKING = 4,       // Responding, mouth animation
    CURIOUS = 5,        // Surprised, one brow raised
    HAPPY = 6,          // Satisfied, friendly
    FOCUSED = 7,        // Intense, narrowed eyes
    MISCHIEVOUS = 8,    // Playful, asymmetric smirk
    WARNING = 9,        // Alert, yellow/lime color
    ERROR = 10,         // Concerned, red color
    SLEEPING = 11,      // Dormant, closed eyes + Z's
    OFFLINE = 12        // Disconnected, gray color
};

// ============================================================
// COLOR PALETTE - WISE² IMP BRANDING
// ============================================================

#define IMP_BLUE_DARK      0x0080D0   // Deep electric blue
#define IMP_BLUE_PRIMARY   0x00A8FF   // Primary electric blue
#define IMP_BLUE_BRIGHT    0x28C8FF   // Bright blue highlight
#define IMP_LIME           0xB6FF00   // WISE² lime/yellow
#define IMP_WARNING        0xFFFF00   // Warning yellow
#define IMP_ERROR          0xFF2020   // Error red
#define IMP_GRAY           0x4A4A4A   // Offline gray
#define IMP_BLACK          0x000000   // Background black

// ============================================================
// BLINK STATE
// ============================================================

struct BlinkState {
    bool is_blinking = false;
    uint32_t blink_start_ms = 0;
    uint32_t blink_duration_ms = 150;    // Full blink cycle: 150ms
    uint32_t next_blink_ms = 3000;       // Next blink in 3-7 seconds
    uint32_t blink_randomness = 2000;    // ±2 second variance
};

// ============================================================
// FACE ANIMATION STATE
// ============================================================

struct FaceAnimationState {
    ImpFaceState current_state = ImpFaceState::IDLE;
    ImpFaceState prev_state = ImpFaceState::IDLE;
    uint32_t state_change_ms = 0;

    // Animation frame
    uint32_t animation_frame = 0;
    uint32_t frame_timer_ms = 0;

    // Blink engine
    BlinkState blink;

    // Micro-expression
    float micro_offset_x = 0;   // Pupil micro-movement
    float micro_offset_y = 0;
};

// ============================================================
// RENDER FUNCTIONS (implemented in main firmware)
// ============================================================

void renderImpFace(ImpFaceState state, uint32_t animation_frame, bool is_blinking, float blink_progress);
void updateImpAnimation(FaceAnimationState& state, uint32_t now_ms);
void setImpState(FaceAnimationState& state, ImpFaceState new_state, uint32_t now_ms);

#endif // WISE2_FACE_ENGINE_H
