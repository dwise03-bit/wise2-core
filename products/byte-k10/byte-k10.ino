/*!
 * WISE² K10 — Simple Animated Face
 *
 * Working face animation using text-based rendering
 * All 12 emotional states with LED feedback
 */

#include "unihiker_k10.h"

UNIHIKER_K10 k10;
uint8_t screen_dir = 2;

// Colors
#define COLOR_BLUE     0x0000FF
#define COLOR_GREEN    0x00FF00
#define COLOR_RED      0xFF0000
#define COLOR_YELLOW   0xFFFF00
#define COLOR_CYAN     0x00FFFF
#define COLOR_WHITE    0xFFFFFF
#define COLOR_BLACK    0x000000

// Face states
enum FaceState {
    BOOT, IDLE, LISTENING, THINKING, SPEAKING,
    CURIOUS, HAPPY, FOCUSED, MISCHIEVOUS, WARNING, ERROR, SLEEPING, OFFLINE
};

FaceState current_state = BOOT;
uint32_t last_change = 0;
uint32_t state_duration = 3000;

void setup() {
    Serial.begin(115200);
    delay(500);

    Serial.println("\n╔════════════════════════════════════════╗");
    Serial.println("║    WISE² K10 ANIMATED FACE DEMO       ║");
    Serial.println("║    12 Emotional States + LED Sync     ║");
    Serial.println("╚════════════════════════════════════════╝\n");

    // Init hardware
    Serial.println("[1/2] Initializing K10...");
    k10.begin();
    delay(100);

    // Init display
    Serial.println("[2/2] Starting face engine...");
    k10.initScreen(screen_dir);
    k10.creatCanvas();
    delay(100);

    Serial.println("\n✅ Face engine ready!");
    Serial.println("   Cycling through all 12 emotional states\n");

    last_change = millis();
    current_state = BOOT;
}

void drawFace(FaceState state) {
    k10.canvas->canvasClear();

    uint16_t text_color = COLOR_BLUE;
    uint32_t led_color = 0x0000FF;
    const char* state_name = "STATE";
    const char* eyes = "OO";
    const char* mouth = "-";

    switch(state) {
        case BOOT:
            text_color = COLOR_YELLOW;
            led_color = 0xFFFF00;
            state_name = "BOOT";
            eyes = "••";
            mouth = "-";
            break;
        case IDLE:
            text_color = COLOR_GREEN;
            led_color = 0x00FF00;
            state_name = "IDLE";
            eyes = "◯◯";
            mouth = "-";
            break;
        case LISTENING:
            text_color = COLOR_CYAN;
            led_color = 0x00FFFF;
            state_name = "LISTENING";
            eyes = "◯◯";
            mouth = "◎";
            break;
        case THINKING:
            text_color = COLOR_YELLOW;
            led_color = 0xFFFF00;
            state_name = "THINKING";
            eyes = "◐◑";
            mouth = "~";
            break;
        case SPEAKING:
            text_color = COLOR_CYAN;
            led_color = 0x00FFFF;
            state_name = "SPEAKING";
            eyes = "◯◯";
            mouth = "O";
            break;
        case CURIOUS:
            text_color = COLOR_YELLOW;
            led_color = 0xFFFF00;
            state_name = "CURIOUS";
            eyes = "◯◐";
            mouth = "?";
            break;
        case HAPPY:
            text_color = COLOR_GREEN;
            led_color = 0x00FF00;
            state_name = "HAPPY";
            eyes = "◯◯";
            mouth = "U";
            break;
        case FOCUSED:
            text_color = COLOR_BLUE;
            led_color = 0x0000FF;
            state_name = "FOCUSED";
            eyes = "︽︾";
            mouth = "-";
            break;
        case MISCHIEVOUS:
            text_color = COLOR_CYAN;
            led_color = 0x00FFFF;
            state_name = "PLAYFUL";
            eyes = "◐◑";
            mouth = "D";
            break;
        case WARNING:
            text_color = COLOR_YELLOW;
            led_color = 0xFFFF00;
            state_name = "WARNING";
            eyes = "⚠ ⚠";
            mouth = "!";
            break;
        case ERROR:
            text_color = COLOR_RED;
            led_color = 0xFF0000;
            state_name = "ERROR";
            eyes = "✕ ✕";
            mouth = ":";
            break;
        case SLEEPING:
            text_color = 0x808080;
            led_color = 0x808080;
            state_name = "SLEEPING";
            eyes = "- -";
            mouth = "z";
            break;
        case OFFLINE:
            text_color = 0x808080;
            led_color = 0x808080;
            state_name = "OFFLINE";
            eyes = "✓ ✓";
            mouth = "/";
            break;
    }

    // Draw face
    k10.canvas->canvasText("WISE2 K10", 10, 20, COLOR_GREEN, k10.canvas->eCNAndENFont16, 30, false);
    k10.canvas->canvasText("IMP FACE", 10, 50, text_color, k10.canvas->eCNAndENFont24, 25, false);

    // Eyes
    k10.canvas->canvasText(eyes, 50, 120, text_color, k10.canvas->eCNAndENFont24, 40, false);

    // Mouth
    k10.canvas->canvasText(mouth, 120, 200, text_color, k10.canvas->eCNAndENFont24, 30, false);

    // Status
    k10.canvas->canvasText(state_name, 10, 260, text_color, k10.canvas->eCNAndENFont16, 25, false);

    k10.canvas->updateCanvas();

    // Update LED
    k10.rgb->brightness(9);
    k10.rgb->write(-1, led_color);

    Serial.printf("[FACE] %s - Display: %s, LED: #%06X\n", state_name, eyes, led_color);
}

void loop() {
    uint32_t now = millis();

    // State transition
    if (now - last_change > state_duration) {
        last_change = now;
        current_state = (FaceState)((current_state + 1) % 13);
    }

    // Render
    drawFace(current_state);
    delay(500);
}
