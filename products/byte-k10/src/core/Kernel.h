#pragma once

#include <stdint.h>

#include "Status.h"
#include "../display/DisplayManager.h"
#include "../input/InputManager.h"
#include "../face/ByteFace.h"

namespace byte_os {

class Application;

/**
 * The BYTE kernel.
 *
 * Owns the frame loop and the application stack. Applications never touch
 * hardware: they receive a DisplayManager to draw with and InputReports to
 * react to, both of which are interfaces.
 *
 * Navigation is a stack rather than a list so "back" is well defined at any
 * depth: launching pushes, Back pops, and popping the last entry returns to
 * the root (the Dashboard) rather than leaving nothing on screen.
 */
class Kernel {
public:
    static constexpr uint8_t kMaxApps  = 16;
    static constexpr uint8_t kMaxDepth = 8;

    Kernel(DisplayManager& display, InputManager& input);

    /** Register an app. The first registered becomes the root. */
    Status registerApp(Application* app);

    Status begin();

    /** Run one frame: input -> update -> draw -> present. */
    void tick();

    /** Push an app by id. Returns false if unknown. */
    bool launch(const char* id);
    /** Pop the current app. No-op at the root. */
    void back();

    Application* current() const;
    ByteFace& face() { return face_; }
    DisplayManager& display() { return display_; }
    InputManager& input() { return input_; }

    uint8_t appCount() const { return appCount_; }
    Application* appAt(uint8_t i) const { return i < appCount_ ? apps_[i] : nullptr; }

    /** Seconds since begin(). */
    uint32_t uptimeSec() const;

    /** Whether the display is currently asleep. */
    bool asleep() const { return asleep_; }
    void wake();

    /**
     * Two-stage idle behaviour.
     *
     * dozeMs   BYTE drifts into the Sleeping animation but the screen stays
     *          lit, so an idle device still looks alive and charming.
     * sleepMs  backlight off and rendering suspended, to save power.
     *
     * A single-stage blank was tried first and was a mistake: a dark panel is
     * indistinguishable from a crashed board. Either value may be 0 to
     * disable that stage.
     */
    void setIdleTimeouts(uint32_t dozeMs, uint32_t sleepMs) {
        dozeTimeoutMs_ = dozeMs;
        sleepTimeoutMs_ = sleepMs;
    }
    bool dozing() const { return dozing_; }

private:
    DisplayManager& display_;
    InputManager&   input_;
    ByteFace        face_;

    Application* apps_[kMaxApps] = {nullptr};
    uint8_t      appCount_ = 0;

    Application* stack_[kMaxDepth] = {nullptr};
    uint8_t      depth_ = 0;

    uint32_t startMs_    = 0;
    uint32_t lastTickMs_ = 0;
    uint32_t dozeTimeoutMs_  = 60000;    // 1 min  -> sleepy face, still lit
    uint32_t sleepTimeoutMs_ = 600000;   // 10 min -> backlight off
    bool     dozing_ = false;
    bool     asleep_ = false;
    ByteState preDozeState_ = ByteState::Idle;

    Application* findApp(const char* id) const;
    void doze();
    void sleep();
};

}  // namespace byte_os
