#include "unihiker_k10.h"

namespace {

UNIHIKER_K10 gBoard;
Music        gMusic;

enum class Screen : uint8_t {
    Dashboard = 0,
    Motion = 1,
    Audio = 2,
};

Screen   gScreen = Screen::Dashboard;
bool     gLastA = false;
bool     gLastB = false;
uint32_t gLastDrawMs = 0;
uint32_t gLastInputMs = 0;
uint32_t gBootMs = 0;
int      gAx = 0;
int      gAy = 0;
int      gAz = 0;
char     gStatus[64] = "ready";

constexpr uint32_t kBg      = 0x10161D;
constexpr uint32_t kPanel   = 0x19232C;
constexpr uint32_t kAccent  = 0x4CFF7A;
constexpr uint32_t kAccent2 = 0x58B8FF;
constexpr uint32_t kText    = 0xF2F5F8;
constexpr uint32_t kMuted   = 0x93A1AD;
constexpr uint32_t kWarn    = 0xFFB02E;

void setStatus(const char* text) {
    snprintf(gStatus, sizeof(gStatus), "%s", text ? text : "");
    Serial.printf("[DEMO] %s\n", gStatus);
    Serial.flush();
}

void fillScreen(uint32_t color) {
    gBoard.setScreenBackground(color);
    gBoard.canvas->canvasSetLineWidth(1);
    gBoard.canvas->canvasRectangle(0, 0, 240, 320, color, color, true);
}

void drawHeader(const char* title, const char* subtitle) {
    gBoard.canvas->canvasText(title, 12, 14, kText, Canvas::eCNAndENFont24, 60, false);
    gBoard.canvas->canvasText(subtitle, 12, 42, kMuted, Canvas::eCNAndENFont16, 60, false);
    gBoard.canvas->canvasRectangle(12, 66, 216, 2, kAccent, kAccent, true);
}

void drawFooter(const char* left, const char* right) {
    gBoard.canvas->canvasRectangle(0, 284, 240, 36, kPanel, kPanel, true);
    gBoard.canvas->canvasText(left, 12, 294, kMuted, Canvas::eCNAndENFont16, 60, false);
    gBoard.canvas->canvasText(right, 132, 294, kMuted, Canvas::eCNAndENFont16, 60, false);
}

void renderDashboard() {
    char line[64];
    drawHeader("WISE2 DEMO", "stable vendor mode");

    const uint32_t up = (millis() - gBootMs) / 1000UL;
    snprintf(line, sizeof(line), "uptime  %lus", (unsigned long)up);
    gBoard.canvas->canvasText(line, 16, 92, kText, Canvas::eCNAndENFont24, 60, false);

    snprintf(line, sizeof(line), "status  %s", gStatus);
    gBoard.canvas->canvasText(line, 16, 126, kAccent, Canvas::eCNAndENFont16, 60, false);

    snprintf(line, sizeof(line), "buttons A/B live");
    gBoard.canvas->canvasText(line, 16, 154, kAccent2, Canvas::eCNAndENFont16, 60, false);

    snprintf(line, sizeof(line), "tilt left/right changes page");
    gBoard.canvas->canvasText(line, 16, 178, kAccent2, Canvas::eCNAndENFont16, 60, false);

    snprintf(line, sizeof(line), "screen path bypasses old UI");
    gBoard.canvas->canvasText(line, 16, 202, kWarn, Canvas::eCNAndENFont16, 60, false);

    drawFooter("A next", "B beep");
}

void renderMotion() {
    char line[64];
    drawHeader("MOTION", "accelerometer live");

    snprintf(line, sizeof(line), "ax  %d", gAx);
    gBoard.canvas->canvasText(line, 16, 96, kText, Canvas::eCNAndENFont24, 60, false);

    snprintf(line, sizeof(line), "ay  %d", gAy);
    gBoard.canvas->canvasText(line, 16, 134, kText, Canvas::eCNAndENFont24, 60, false);

    snprintf(line, sizeof(line), "az  %d", gAz);
    gBoard.canvas->canvasText(line, 16, 172, kText, Canvas::eCNAndENFont24, 60, false);

    const int strength = abs(gAx) + abs(gAy) + abs(gAz);
    snprintf(line, sizeof(line), "strength  %d", strength);
    gBoard.canvas->canvasText(line, 16, 214, strength > 1600 ? kWarn : kAccent,
                              Canvas::eCNAndENFont16, 60, false);

    drawFooter("A next", "B tone");
}

void renderAudio() {
    drawHeader("AUDIO", "speaker check");
    gBoard.canvas->canvasText("press B for a tone", 16, 102, kText,
                              Canvas::eCNAndENFont24, 60, false);
    gBoard.canvas->canvasText("A changes page", 16, 148, kAccent2,
                              Canvas::eCNAndENFont16, 60, false);
    gBoard.canvas->canvasText("tilt left/right also works", 16, 176, kAccent2,
                              Canvas::eCNAndENFont16, 60, false);
    gBoard.canvas->canvasText(gStatus, 16, 220, kAccent,
                              Canvas::eCNAndENFont16, 60, false);
    drawFooter("A next", "B play");
}

void renderScreen() {
    fillScreen(kBg);

    switch (gScreen) {
        case Screen::Dashboard: renderDashboard(); break;
        case Screen::Motion:    renderMotion(); break;
        case Screen::Audio:     renderAudio(); break;
    }

    gBoard.canvas->updateCanvas();
}

void nextScreen() {
    gScreen = static_cast<Screen>((static_cast<uint8_t>(gScreen) + 1) % 3);
    switch (gScreen) {
        case Screen::Dashboard: setStatus("dashboard"); break;
        case Screen::Motion:    setStatus("motion"); break;
        case Screen::Audio:     setStatus("audio"); break;
    }
}

void playFeedbackTone() {
    setStatus("tone");
    gMusic.playTone(880, 1800);
}

void pollInputs() {
    const bool a = gBoard.buttonA && gBoard.buttonA->isPressed();
    const bool b = gBoard.buttonB && gBoard.buttonB->isPressed();

    if (a && !gLastA) {
        gLastInputMs = millis();
        nextScreen();
    }
    if (b && !gLastB) {
        gLastInputMs = millis();
        playFeedbackTone();
    }

    gLastA = a;
    gLastB = b;

    if (gBoard.isGesture(TiltLeft)) {
        gLastInputMs = millis();
        gScreen = Screen::Dashboard;
        setStatus("tilt left");
    } else if (gBoard.isGesture(TiltRight)) {
        gLastInputMs = millis();
        gScreen = Screen::Audio;
        setStatus("tilt right");
    }
}

}  // namespace

void setup() {
    Serial.begin(115200);
    delay(400);

    Serial.println("[DEMO] boot");
    Serial.flush();

    gBoard.begin();
    delay(120);
    gBoard.initScreen(2);
    gBoard.creatCanvas();
    gBootMs = millis();
    gLastInputMs = gBootMs;
    setStatus("boot ok");

    renderScreen();
}

void loop() {
    gAx = gBoard.getAccelerometerX();
    gAy = gBoard.getAccelerometerY();
    gAz = gBoard.getAccelerometerZ();

    pollInputs();

    const uint32_t now = millis();
    if (now - gLastDrawMs >= 150) {
        gLastDrawMs = now;
        renderScreen();
    }

    if (now - gLastInputMs >= 12000 && gScreen != Screen::Dashboard) {
        gScreen = Screen::Dashboard;
        setStatus("idle home");
    }

    delay(20);
}
