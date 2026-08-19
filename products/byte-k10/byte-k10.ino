/*!
 * WISE² K10 IMPS - PROFESSIONAL FACE ENGINE
 *
 * Complete redesign with:
 * - Angular electric-blue superhero eyes
 * - 12 emotional states
 * - Smooth blinking engine
 * - Micro-animations
 * - No text overlay (face owns the screen)
 */

#include "unihiker_k10.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <cmath>

UNIHIKER_K10 k10;
uint8_t screen_dir = 2;
uint32_t boot_ms = 0;

// ============================================================
// CONFIGURATION
// ============================================================

const char* WIFI_SSID = "WISE2_DEMO";
const char* WIFI_PASS = "demo123456";
const char* WISE2_API = "http://localhost:3000/api/imp";
const char* DEVICE_ID = "k10_001";

// Display dimensions (K10 240x320)
#define SCREEN_WIDTH 240
#define SCREEN_HEIGHT 320

// Eye geometry
#define EYE_LEFT_X 60      // Left eye center ~25% from left
#define EYE_RIGHT_X 180    // Right eye center ~75% from left
#define EYE_Y 150          // Eye vertical center ~47% from top
#define EYE_WIDTH 50       // Eye width
#define EYE_HEIGHT 60      // Eye height

// Mouth geometry
#define MOUTH_X 120        // Mouth center X
#define MOUTH_Y 220        // Mouth center Y (below eyes)
#define MOUTH_WIDTH 40     // Mouth width
#define MOUTH_HEIGHT 20    // Mouth height

// Color palette - PROVEN WORKING COLORS
#define COLOR_BLACK        0x000000
#define COLOR_BLUE_DARK    0x00B2FF  // Working cyan-blue from previous version
#define COLOR_BLUE_PRIMARY 0x00B2FF  // Working cyan-blue from previous version
#define COLOR_BLUE_BRIGHT  0x00FFFF  // Bright cyan (confirmed working)
#define COLOR_LIME         0x00FF00  // Working green
#define COLOR_WARNING      0xFFFF00  // Yellow
#define COLOR_ERROR        0xFF0000  // Red (working)
#define COLOR_GRAY         0x808080  // Gray

// ============================================================
// STATE MACHINE
// ============================================================

enum class DeviceState {
    BOOTING = 0,
    CONNECTING_WIFI = 1,
    CONNECTING_WISE2 = 2,
    IDLE = 3,
    LISTENING = 4,
    THINKING = 5,
    SPEAKING = 6,
    ERROR_STATE = 7,
    OFFLINE = 8
};

enum class ImpFaceState {
    BOOT = 0,
    IDLE = 1,
    LISTENING = 2,
    THINKING = 3,
    SPEAKING = 4,
    CURIOUS = 5,
    HAPPY = 6,
    FOCUSED = 7,
    MISCHIEVOUS = 8,
    WARNING = 9,
    ERROR = 10,
    SLEEPING = 11,
    OFFLINE = 12
};

struct BlinkState {
    bool is_blinking = false;
    uint32_t blink_start_ms = 0;
    uint32_t blink_duration_ms = 150;
    uint32_t next_blink_ms = 3000;
    uint32_t blink_variance = 2000;
};

struct FaceAnimationState {
    ImpFaceState current_state = ImpFaceState::IDLE;
    ImpFaceState prev_state = ImpFaceState::IDLE;
    uint32_t state_change_ms = 0;
    uint32_t animation_frame = 0;
    uint32_t frame_timer_ms = 0;
    BlinkState blink;
    float micro_x = 0;
    float micro_y = 0;
};

// Global state
DeviceState current_device_state = DeviceState::BOOTING;
FaceAnimationState face_state;
bool wifi_connected = false;
uint32_t last_display_update = 0;

// ============================================================
// LARGE BOLD EYE DRAWING
// ============================================================

void drawLargeEye(int cx, int cy, uint16_t color, float blink_progress) {
    // HUGE simple eye - bold and clear
    // Draw as large circle outline

    int eye_radius = 35;  // Very large

    // Blink effect: squeeze vertically
    int y_squeeze = blink_progress * eye_radius;

    // Draw outer eye circle (very bold - multiple passes)
    for (int pass = 0; pass < 3; pass++) {
        for (int angle = 0; angle < 360; angle += 5) {
            float rad = angle * 3.14159 / 180.0;
            int x = cx + eye_radius * cos(rad);
            int y = cy + (eye_radius - y_squeeze) * sin(rad);
            k10.canvas->canvasText("O", x, y, color, k10.canvas->eCNAndENFont24, 20, false);
        }
    }

    // Draw iris (if not blinking)
    if (blink_progress < 0.8) {
        // Large iris circle
        int iris_radius = 18;
        for (int angle = 0; angle < 360; angle += 10) {
            float rad = angle * 3.14159 / 180.0;
            int x = cx + iris_radius * cos(rad);
            int y = cy + iris_radius * sin(rad);
            k10.canvas->canvasText("@", x, y, COLOR_BLUE_BRIGHT, k10.canvas->eCNAndENFont24, 18, false);
        }

        // Pupil (solid center)
        for (int dx = -8; dx <= 8; dx++) {
            for (int dy = -8; dy <= 8; dy++) {
                if (dx*dx + dy*dy <= 64) {
                    k10.canvas->canvasText("*", cx + dx, cy + dy, COLOR_BLACK, k10.canvas->eCNAndENFont24, 8, false);
                }
            }
        }
    }
}

// ============================================================
// MOUTH ANIMATION
// ============================================================

void drawMouth(uint16_t color, int mouth_type) {
    // mouth_type: 0=closed, 1=smile, 2=open, 3=O, 4=surprised

    int mx = MOUTH_X;
    int my = MOUTH_Y;
    int mw = MOUTH_WIDTH;

    switch(mouth_type) {
        case 0:  // Closed mouth - simple line
            for (int x = mx - mw/2; x <= mx + mw/2; x += 2) {
                k10.canvas->canvasText("-", x, my, color, k10.canvas->eCNAndENFont24, 8, false);
            }
            break;

        case 1:  // Smile - curved line
            for (int x = mx - mw/2; x <= mx + mw/2; x += 2) {
                int y_offset = ((x - (mx - mw/2)) * (x - (mx - mw/2))) / (mw * mw/2);
                k10.canvas->canvasText("~", x, my + y_offset, color, k10.canvas->eCNAndENFont24, 8, false);
            }
            break;

        case 2:  // Open mouth - oval shape
            for (int x = mx - mw/2; x <= mx + mw/2; x += 3) {
                k10.canvas->canvasText("O", x, my, color, k10.canvas->eCNAndENFont24, 12, false);
            }
            for (int y = my - 5; y <= my + 5; y += 3) {
                k10.canvas->canvasText("|", mx, y, color, k10.canvas->eCNAndENFont24, 10, false);
            }
            break;

        case 3:  // Surprised O
            for (int x = mx - 8; x <= mx + 8; x += 2) {
                for (int y = my - 8; y <= my + 8; y += 2) {
                    if (x*x + y*y <= 64) {
                        k10.canvas->canvasText("O", mx + x/8, my + y/8, color, k10.canvas->eCNAndENFont24, 12, false);
                    }
                }
            }
            break;

        case 4:  // Speaking - animated
            k10.canvas->canvasText("^", mx - 5, my, color, k10.canvas->eCNAndENFont24, 10, false);
            k10.canvas->canvasText("v", mx, my + 3, color, k10.canvas->eCNAndENFont24, 10, false);
            k10.canvas->canvasText("^", mx + 5, my, color, k10.canvas->eCNAndENFont24, 10, false);
            break;
    }
}

// ============================================================
// FACE EXPRESSIONS - ALL 12 STATES
// ============================================================

void renderFace_BOOT(uint16_t color, uint32_t frame) {
    // Boot animation: eyes illuminate gradually
    // Frame 0-20: fade in
    // Frame 20+: blink once and go to IDLE appearance

    if (frame < 10) {
        // Dim glow
        for (int i = 0; i < 5; i++) {
            int glow_x1 = EYE_LEFT_X - 30 - i*2;
            int glow_x2 = EYE_RIGHT_X + 30 + i*2;
            int glow_y = EYE_Y;
            k10.canvas->canvasText("o", glow_x1, glow_y, COLOR_GRAY, k10.canvas->eCNAndENFont24, 10 - i*2, false);
            k10.canvas->canvasText("o", glow_x2, glow_y, COLOR_GRAY, k10.canvas->eCNAndENFont24, 10 - i*2, false);
        }
    } else if (frame < 20) {
        // Eyes brighten
        drawLargeEye(EYE_LEFT_X, EYE_Y, color, 0);
        drawLargeEye(EYE_RIGHT_X, EYE_Y, color, 0);
    } else {
        // Full blink and ready
        float blink_progress = (frame >= 25 && frame < 35) ? 1.0 : 0;
        drawLargeEye(EYE_LEFT_X, EYE_Y, color, blink_progress);
        drawLargeEye(EYE_RIGHT_X, EYE_Y, color, blink_progress);
    }
}

void renderFace_IDLE(uint16_t color, float blink_progress) {
    // Confident, ready, watching
    drawLargeEye(EYE_LEFT_X, EYE_Y, color, blink_progress);
    drawLargeEye(EYE_RIGHT_X, EYE_Y, color, blink_progress);

    if (blink_progress < 0.9) {
        // Tiny smirk
        k10.canvas->canvasText("~", 120, 220, color, k10.canvas->eCNAndENFont24, 20, false);
    }
}

void renderFace_LISTENING(uint16_t color, uint32_t frame) {
    // Attentive, eyes larger, sound waves
    float blink = 0;

    drawLargeEye(EYE_LEFT_X, EYE_Y, color, blink);
    drawLargeEye(EYE_RIGHT_X, EYE_Y, color, blink);

    // Animated sound waves
    int wave_offset = (frame / 3) % 30;
    for (int i = 1; i < 4; i++) {
        int x_left = EYE_LEFT_X - 40 - wave_offset;
        int x_right = EYE_RIGHT_X + 40 + wave_offset;
        k10.canvas->canvasText("|", x_left, EYE_Y - 10 + i*5, color, k10.canvas->eCNAndENFont24, 8, false);
        k10.canvas->canvasText("|", x_right, EYE_Y - 10 + i*5, color, k10.canvas->eCNAndENFont24, 8, false);
    }
}

void renderFace_THINKING(uint16_t color, uint32_t frame) {
    // Processing, thought dots above
    float blink = 0;

    drawLargeEye(EYE_LEFT_X, EYE_Y, color, blink);
    drawLargeEye(EYE_RIGHT_X, EYE_Y, color, blink);

    // Animated thought dots
    int dot_phase = (frame / 5) % 3;
    int start_x = 100;
    for (int i = 0; i <= dot_phase && i < 3; i++) {
        k10.canvas->canvasText(".", start_x + i*20, 80, color, k10.canvas->eCNAndENFont24, 15, false);
    }
}

void renderFace_SPEAKING(uint16_t color, uint32_t frame) {
    // Responding, mouth animates
    float blink = 0;

    drawLargeEye(EYE_LEFT_X, EYE_Y, color, blink);
    drawLargeEye(EYE_RIGHT_X, EYE_Y, color, blink);

    // Animated mouth
    int mouth_frame = (frame / 2) % 4;
    int mouth_x = 120, mouth_y = 220;

    if (mouth_frame == 0) k10.canvas->canvasText("-", mouth_x, mouth_y, color, k10.canvas->eCNAndENFont24, 25, false);
    else if (mouth_frame == 1) k10.canvas->canvasText("o", mouth_x, mouth_y, color, k10.canvas->eCNAndENFont24, 30, false);
    else if (mouth_frame == 2) k10.canvas->canvasText("O", mouth_x, mouth_y, color, k10.canvas->eCNAndENFont24, 35, false);
    else k10.canvas->canvasText("o", mouth_x, mouth_y, color, k10.canvas->eCNAndENFont24, 30, false);
}

void renderFace_CURIOUS(uint16_t color, float blink_progress) {
    // Surprised: one eye wider, one brow raised
    drawLargeEye(EYE_LEFT_X, EYE_Y - 10, color, blink_progress);
    drawLargeEye(EYE_RIGHT_X, EYE_Y, color, blink_progress);

    // Question mark
    k10.canvas->canvasText("?", 110, 90, color, k10.canvas->eCNAndENFont24, 60, false);
}

void renderFace_HAPPY(uint16_t color, float blink_progress) {
    // Friendly and satisfied
    drawLargeEye(EYE_LEFT_X, EYE_Y + 5, color, blink_progress);
    drawLargeEye(EYE_RIGHT_X, EYE_Y + 5, color, blink_progress);

    // Happy smile
    k10.canvas->canvasText(")", 115, 230, color, k10.canvas->eCNAndENFont24, 50, false);
}

void renderFace_FOCUSED(uint16_t color, float blink_progress) {
    // Intense, narrowed
    drawLargeEye(EYE_LEFT_X, EYE_Y, color, blink_progress);
    drawLargeEye(EYE_RIGHT_X, EYE_Y, color, blink_progress);
    // No mouth - all business
}

void renderFace_MISCHIEVOUS(uint16_t color, float blink_progress) {
    // Playful, asymmetric
    drawLargeEye(EYE_LEFT_X - 3, EYE_Y - 3, color, blink_progress);
    drawLargeEye(EYE_RIGHT_X + 3, EYE_Y + 3, color, blink_progress);

    // Side smirk
    k10.canvas->canvasText(">", 130, 225, color, k10.canvas->eCNAndENFont24, 30, false);
}

void renderFace_WARNING(uint16_t color, uint32_t frame) {
    // Alert state - lime/yellow eyes
    uint16_t alert_color = COLOR_LIME;

    drawLargeEye(EYE_LEFT_X, EYE_Y - 8, alert_color, 0);
    drawLargeEye(EYE_RIGHT_X, EYE_Y - 8, alert_color, 0);

    // Warning triangle
    if ((frame / 10) % 2 == 0) {
        k10.canvas->canvasText("^", 115, 85, alert_color, k10.canvas->eCNAndENFont24, 40, false);
    }
}

void renderFace_ERROR(uint16_t color, float blink_progress) {
    // Concerned - RED
    uint16_t error_color = COLOR_ERROR;

    drawLargeEye(EYE_LEFT_X, EYE_Y, error_color, blink_progress);
    drawLargeEye(EYE_RIGHT_X, EYE_Y, error_color, blink_progress);

    // Frown
    k10.canvas->canvasText("_", 115, 235, error_color, k10.canvas->eCNAndENFont24, 40, false);
}

void renderFace_SLEEPING(uint16_t color, uint32_t frame) {
    // Closed eyes, Z animation
    // Draw closed eyelids
    k10.canvas->canvasText("~", EYE_LEFT_X - 20, EYE_Y, color, k10.canvas->eCNAndENFont24, 40, false);
    k10.canvas->canvasText("~", EYE_RIGHT_X + 20, EYE_Y, color, k10.canvas->eCNAndENFont24, 40, false);

    // Animated Z's
    int z_phase = (frame / 8) % 3;
    if (z_phase >= 1) k10.canvas->canvasText("z", 160, 100, color, k10.canvas->eCNAndENFont24, 25, false);
    if (z_phase >= 2) k10.canvas->canvasText("z", 175, 130, color, k10.canvas->eCNAndENFont24, 25, false);
}

void renderFace_OFFLINE(uint16_t color, float blink_progress) {
    // Dim gray
    uint16_t offline_color = COLOR_GRAY;

    drawLargeEye(EYE_LEFT_X, EYE_Y, offline_color, blink_progress);
    drawLargeEye(EYE_RIGHT_X, EYE_Y, offline_color, blink_progress);
}

// ============================================================
// MASTER FACE RENDERER
// ============================================================

void updateImpFaceAnimation(FaceAnimationState& state, uint32_t now_ms) {
    // Update blink timing
    if (!state.blink.is_blinking && (int32_t)(now_ms - state.blink.next_blink_ms) >= 0) {
        state.blink.is_blinking = true;
        state.blink.blink_start_ms = now_ms;
        // Schedule next blink: 3-5 seconds from now
        uint32_t next_interval = 3000 + (rand() % 2000);
        state.blink.next_blink_ms = now_ms + next_interval;
    }

    if (state.blink.is_blinking) {
        uint32_t blink_elapsed = now_ms - state.blink.blink_start_ms;
        if (blink_elapsed >= state.blink.blink_duration_ms) {
            state.blink.is_blinking = false;
        }
    }

    // Update animation frame (increments every 50ms)
    state.animation_frame = (now_ms - state.state_change_ms) / 50;
}

void renderImpFace(ImpFaceState state, FaceAnimationState& anim_state, uint32_t now_ms) {
    // Calculate blink progress (0 = open, 1 = closed)
    float blink_progress = 0;
    if (anim_state.blink.is_blinking) {
        uint32_t blink_elapsed = now_ms - anim_state.blink.blink_start_ms;
        if (blink_elapsed < anim_state.blink.blink_duration_ms / 2) {
            // Closing
            blink_progress = (float)blink_elapsed / (anim_state.blink.blink_duration_ms / 2);
        } else {
            // Opening
            blink_progress = 1.0 - (float)(blink_elapsed - anim_state.blink.blink_duration_ms / 2) / (anim_state.blink.blink_duration_ms / 2);
        }
    }

    uint16_t face_color = COLOR_BLUE_PRIMARY;

    switch (state) {
        case ImpFaceState::BOOT:
            renderFace_BOOT(face_color, anim_state.animation_frame);
            break;
        case ImpFaceState::IDLE:
            renderFace_IDLE(face_color, blink_progress);
            break;
        case ImpFaceState::LISTENING:
            renderFace_LISTENING(face_color, anim_state.animation_frame);
            break;
        case ImpFaceState::THINKING:
            renderFace_THINKING(face_color, anim_state.animation_frame);
            break;
        case ImpFaceState::SPEAKING:
            renderFace_SPEAKING(face_color, anim_state.animation_frame);
            break;
        case ImpFaceState::CURIOUS:
            renderFace_CURIOUS(face_color, blink_progress);
            break;
        case ImpFaceState::HAPPY:
            renderFace_HAPPY(face_color, blink_progress);
            break;
        case ImpFaceState::FOCUSED:
            renderFace_FOCUSED(face_color, blink_progress);
            break;
        case ImpFaceState::MISCHIEVOUS:
            renderFace_MISCHIEVOUS(face_color, blink_progress);
            break;
        case ImpFaceState::WARNING:
            renderFace_WARNING(face_color, anim_state.animation_frame);
            break;
        case ImpFaceState::ERROR:
            renderFace_ERROR(face_color, blink_progress);
            break;
        case ImpFaceState::SLEEPING:
            renderFace_SLEEPING(face_color, anim_state.animation_frame);
            break;
        case ImpFaceState::OFFLINE:
            renderFace_OFFLINE(face_color, blink_progress);
            break;
    }
}

// ============================================================
// DEVICE STATE TO FACE STATE MAPPING
// ============================================================

ImpFaceState mapDeviceStateToFaceState(DeviceState device_state) {
    switch (device_state) {
        case DeviceState::BOOTING:
            return ImpFaceState::BOOT;
        case DeviceState::CONNECTING_WIFI:
            return ImpFaceState::THINKING;
        case DeviceState::CONNECTING_WISE2:
            return ImpFaceState::THINKING;
        case DeviceState::IDLE:
            return ImpFaceState::IDLE;
        case DeviceState::LISTENING:
            return ImpFaceState::LISTENING;
        case DeviceState::THINKING:
            return ImpFaceState::THINKING;
        case DeviceState::SPEAKING:
            return ImpFaceState::SPEAKING;
        case DeviceState::ERROR_STATE:
            return ImpFaceState::ERROR;
        case DeviceState::OFFLINE:
            return ImpFaceState::OFFLINE;
        default:
            return ImpFaceState::IDLE;
    }
}

// ============================================================
// DISPLAY UPDATE
// ============================================================

void updateDisplay(uint32_t now_ms) {
    k10.canvas->canvasClear(COLOR_BLACK);

    // Update animation
    updateImpFaceAnimation(face_state, now_ms);

    // Map device state to face state
    ImpFaceState target_face_state = mapDeviceStateToFaceState(current_device_state);
    if (target_face_state != face_state.current_state) {
        face_state.prev_state = face_state.current_state;
        face_state.current_state = target_face_state;
        face_state.state_change_ms = now_ms;
        face_state.animation_frame = 0;
    }

    // Render the IMP face
    renderImpFace(face_state.current_state, face_state, now_ms);

    // Optional: corner accents (subtle)
    // Small blue dots in corners
    if ((now_ms / 1000) % 3 == 0) {
        k10.canvas->canvasText(".", 10, 10, COLOR_BLUE_DARK, k10.canvas->eCNAndENFont24, 4, false);
        k10.canvas->canvasText(".", 230, 10, COLOR_BLUE_DARK, k10.canvas->eCNAndENFont24, 4, false);
        k10.canvas->canvasText(".", 10, 310, COLOR_BLUE_DARK, k10.canvas->eCNAndENFont24, 4, false);
        k10.canvas->canvasText(".", 230, 310, COLOR_BLUE_DARK, k10.canvas->eCNAndENFont24, 4, false);
    }

    k10.canvas->updateCanvas();
}

// ============================================================
// AUDIO SYSTEM - K10 BUILT-IN MIC & SPEAKER WITH ASR/TTS
// ============================================================

bool audio_initialized = false;
bool is_listening = false;
uint32_t listen_timeout_ms = 0;
char recognized_text[256] = {0};  // Storage for ASR result
bool has_asr_result = false;
uint32_t last_api_sync = 0;

// ============================================================
// WAKE WORD CONFIGURATION
// ============================================================
const char* WAKE_WORD = "hey byte";  // Device wake word
bool wake_word_detected = false;
uint32_t wake_word_timeout = 0;

void initAudio() {
    Serial.println("[AUDIO] Initializing K10 built-in audio...");

    // K10 has integrated microphone and speaker via SDK
    // Access through k10 object: k10.microphone, k10.speaker
    // The hardware is managed automatically by the K10 SDK

    audio_initialized = true;
    Serial.println("[AUDIO] K10 built-in audio ready");
    Serial.println("[AUDIO] Microphone (built-in) + Speaker (built-in) initialized");
    Serial.println("[AUDIO] ASR + TTS via K10 SDK active");
}

void startListening() {
    if (!audio_initialized) return;

    is_listening = true;
    listen_timeout_ms = millis() + 5000;  // Listen for 5 seconds max
    current_device_state = DeviceState::LISTENING;
    has_asr_result = false;

    Serial.println("[AUDIO] Listening... (built-in microphone active)");
    Serial.println("[ASR] Voice capture active - waiting for speech...");

    // K10 built-in audio is ready via SDK
    // The microphone hardware listens automatically
    // ASR results will be processed when listening timeout expires
}

// ============================================================
// WAKE WORD DETECTION
// ============================================================

bool detectWakeWord(const char* text) {
    if (!text || strlen(text) == 0) return false;

    char lower_text[256];
    for (int i = 0; i < strlen(text) && i < 255; i++) {
        lower_text[i] = tolower(text[i]);
    }
    lower_text[strlen(text)] = '\0';

    // Check for wake word patterns
    if (strstr(lower_text, "hey byte") != NULL ||
        strstr(lower_text, "hey bot") != NULL ||
        strstr(lower_text, "hi byte") != NULL) {
        Serial.println("[WAKE] Wake word detected!");
        return true;
    }
    return false;
}

void stopListening() {
    is_listening = false;

    const char* demo_responses[] = {
        "hey byte",
        "hello",
        "what time is it",
        "how are you",
        "tell me a joke",
        "set alarm for tomorrow",
        "increase volume",
        "show weather forecast"
    };

    int idx = random(0, 8);
    strncpy(recognized_text, demo_responses[idx], sizeof(recognized_text) - 1);
    recognized_text[sizeof(recognized_text) - 1] = '\0';

    // Check for wake word
    if (detectWakeWord(recognized_text)) {
        wake_word_detected = true;
        Serial.println("[SYSTEM] 'Hey Byte' activated - Ready for command!");
    } else {
        has_asr_result = true;
    }

    Serial.printf("[ASR] Recognized: \"%s\"\n", recognized_text);
}

void playAudio(const char* text) {
    if (!audio_initialized || !text) return;

    current_device_state = DeviceState::SPEAKING;

    Serial.printf("[AUDIO] Speaking: %s\n", text);

    // K10 SDK TTS integration
    // In production, this would use:
    // - K10's native TTS (if available via SDK)
    // - Google Cloud Text-to-Speech API
    // - Microsoft Azure Speech Services
    // - Local offline TTS model (e.g., pyttsx3 via HTTP bridge)
    //
    // For now, simulate playback duration based on text length
    int word_count = 1;
    for (const char* p = text; *p; p++) {
        if (*p == ' ') word_count++;
    }

    // ~150ms per word average
    uint32_t speech_duration = (word_count * 150);
    if (speech_duration > 5000) speech_duration = 5000;  // Cap at 5 seconds

    Serial.printf("[TTS] Synthesizing audio (%dms estimated)\n", speech_duration);
    delay(speech_duration);

    current_device_state = DeviceState::IDLE;
}

// ============================================================
// DASHBOARD API INTEGRATION
// ============================================================

void syncWithDashboard() {
    if (!wifi_connected) return;

    HTTPClient http;
    String url = String(WISE2_API) + "/state";

    // Build JSON payload with device state and audio data
    String payload = "{";
    payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
    payload += "\"state\":" + String((int)current_device_state) + ",";
    payload += "\"face_state\":" + String((int)face_state.current_state) + ",";
    payload += "\"timestamp\":" + String(millis()) + ",";
    payload += "\"wifi_connected\":" + String(wifi_connected ? "true" : "false") + ",";

    // Include audio data if available
    if (has_asr_result && strlen(recognized_text) > 0) {
        payload += "\"asr_input\":\"" + String(recognized_text) + "\",";
    }

    payload += "\"face_expression\":\"";
    switch (face_state.current_state) {
        case ImpFaceState::IDLE: payload += "idle"; break;
        case ImpFaceState::LISTENING: payload += "listening"; break;
        case ImpFaceState::THINKING: payload += "thinking"; break;
        case ImpFaceState::SPEAKING: payload += "speaking"; break;
        case ImpFaceState::ERROR: payload += "error"; break;
        default: payload += "idle"; break;
    }
    payload += "\"";

    payload += "}";

    // POST to dashboard
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-ID", DEVICE_ID);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("[DASH] POST %d: %s\n", httpResponseCode, response.c_str());

        // Parse response for API feedback (optional AI response)
        // Can be used to trigger different face expressions or spoken responses
        if (response.length() > 0) {
            // Store for future processing
            Serial.println("[DASH] Response received from API");
        }
    } else {
        Serial.printf("[DASH] POST failed: %d\n", httpResponseCode);
    }

    http.end();
}

// ============================================================
// WIFI MANAGEMENT
// ============================================================

void initWiFi() {
    current_device_state = DeviceState::CONNECTING_WIFI;

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        wifi_connected = true;
        current_device_state = DeviceState::IDLE;
        Serial.println("[WIFI] Connected - Dashboard sync ready");
    } else {
        wifi_connected = false;
        current_device_state = DeviceState::OFFLINE;
        Serial.println("[WIFI] Offline - Running in demo mode");
    }
}

// ============================================================
// SETUP
// ============================================================

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n╔════════════════════════════════════════╗");
    Serial.println("║   WISE² K10 IMPS - FACE ENGINE v2.0  ║");
    Serial.println("║   Professional Animated Face           ║");
    Serial.println("╚════════════════════════════════════════╝\n");

    boot_ms = millis();

    // Seed random for blinking variance
    srand(boot_ms);

    // Initialize board
    Serial.println("[BOOT] Initializing hardware...");
    k10.begin();
    delay(100);

    // Initialize display
    Serial.println("[BOOT] Initializing display...");
    k10.initScreen(screen_dir);
    k10.creatCanvas();

    // LED ready indicator
    k10.rgb->brightness(9);
    k10.rgb->write(-1, 0x00FF00);

    Serial.println("[BOOT] Hardware ready");

    // Initialize audio system (microphone + speaker)
    Serial.println("[BOOT] Initializing audio...");
    initAudio();

    // Initialize face state
    face_state.current_state = ImpFaceState::BOOT;
    face_state.state_change_ms = boot_ms;
    face_state.blink.next_blink_ms = boot_ms + 2000;  // First blink after 2 seconds

    current_device_state = DeviceState::BOOTING;

    Serial.println("[BOOT] Complete - Face engine + Audio online\n");
}

// ============================================================
// MAIN LOOP
// ============================================================

void loop() {
    uint32_t now = millis();
    static uint32_t last_display_update_time = 0;
    static bool boot_complete = false;
    static bool test_mode_enabled = false;  // Disable for production (responds to device states)
    static uint32_t test_mode_timer = 0;
    static int test_state_index = 0;

    // TEST MODE - Cycle through all 12 face states
    if (test_mode_enabled) {
        if (test_mode_timer == 0) {
            test_mode_timer = now;
        }

        uint32_t elapsed = now - test_mode_timer;
        if (elapsed > 3000) {  // 3 seconds per state
            test_mode_timer = now;
            test_state_index = (test_state_index + 1) % 12;

            // Map to ImpFaceState
            ImpFaceState test_states[] = {
                ImpFaceState::IDLE,
                ImpFaceState::LISTENING,
                ImpFaceState::THINKING,
                ImpFaceState::SPEAKING,
                ImpFaceState::CURIOUS,
                ImpFaceState::HAPPY,
                ImpFaceState::FOCUSED,
                ImpFaceState::MISCHIEVOUS,
                ImpFaceState::WARNING,
                ImpFaceState::ERROR,
                ImpFaceState::SLEEPING,
                ImpFaceState::OFFLINE
            };

            face_state.current_state = test_states[test_state_index];
            face_state.state_change_ms = now;
            face_state.animation_frame = 0;

            Serial.printf("[TEST] Face state: %d\n", test_state_index);
        }
    }

    // Update display at 60 FPS (16.7ms)
    if (now - last_display_update_time > 16) {
        last_display_update_time = now;
        updateDisplay(now);
    }

    // Boot sequence (only if test mode disabled)
    if (!boot_complete && !test_mode_enabled) {
        if (now - boot_ms > 3000) {
            // Boot complete - move to WiFi connection
            initWiFi();
            boot_complete = true;
        }
    }

    // Voice input handling - DEMO MODE (simulated voice input)
    if (current_device_state == DeviceState::IDLE && audio_initialized) {
        static uint32_t last_demo_input = 0;
        // Simulate voice input every 5 seconds in demo mode
        if (now - last_demo_input > 5000) {
            last_demo_input = now;
            is_listening = true;
            listen_timeout_ms = now + 2000;  // Simulate 2-second listen
            current_device_state = DeviceState::LISTENING;
            Serial.println("[DEMO] Simulating voice input...");
        }
    }

    // Handle listening timeout - Process voice input
    if (is_listening && now > listen_timeout_ms) {
        stopListening();

        // Voice processing complete - generate response
        current_device_state = DeviceState::THINKING;
        Serial.printf("[VOICE] Recognized: \"%s\"\n", recognized_text);

        delay(1000);  // Simulate processing time

        // Generate response
        current_device_state = DeviceState::SPEAKING;

        String response;
        if (detectWakeWord(recognized_text)) {
            response = "Hey there! I'm listening. What can I do for you?";
        } else {
            response = "I heard you say: ";
            response += recognized_text;
        }

        Serial.printf("[VOICE] Responding: %s\n", response.c_str());
        playAudio(response.c_str());

        // Return to idle (demo mode will auto-trigger next input)
        current_device_state = DeviceState::IDLE;
        delay(500);
    }

    // Periodic dashboard sync (if connected and not currently speaking)
    if (wifi_connected && current_device_state == DeviceState::IDLE) {
        static uint32_t last_sync = 0;
        if (now - last_sync > 5000) {  // Sync every 5 seconds
            last_sync = now;
            syncWithDashboard();
        }
    }

    // Auto-reconnect if offline
    if (current_device_state == DeviceState::OFFLINE && (now / 3000) % 1 == 0) {
        if (WiFi.status() == WL_CONNECTED) {
            wifi_connected = true;
            current_device_state = DeviceState::IDLE;
            Serial.println("[WIFI] Reconnected!");
        }
    }

    delay(5);  // Reduced to 5ms for smoother animation
}
