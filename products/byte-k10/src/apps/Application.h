#pragma once

#include <stdint.h>

#include "../core/Status.h"
#include "../display/DisplayManager.h"
#include "../input/InputManager.h"

namespace byte_os {

class Kernel;

/**
 * Base class every BYTE application inherits from.
 *
 * Lifecycle, as driven by the kernel:
 *
 *   initialize()            once, at registration
 *   onEnter()               each time the app becomes foreground
 *     update(dtMs)          every tick   (logic; no drawing)
 *     draw(display)         every frame  (drawing; no logic)
 *     onInput(report)       when an event arrives
 *   onExit()                when backgrounded
 *   onSleep() / onWake()    around display sleep
 *
 * `update` and `draw` are deliberately separate so animation timing stays
 * independent of frame rate.
 */
class Application {
public:
    virtual ~Application() = default;

    Application(const Application&) = delete;
    Application& operator=(const Application&) = delete;

    /** Stable identifier used for navigation and settings persistence. */
    virtual const char* id() const = 0;
    /** Human-readable name shown in the launcher and status bar. */
    virtual const char* title() const = 0;

    virtual Status initialize(Kernel& kernel) { (void)kernel; return Status::pass(); }

    virtual void onEnter() {}
    virtual void onExit() {}

    /** Advance app state. `dtMs` is real elapsed time since the last update. */
    virtual void update(uint32_t dtMs) { (void)dtMs; }

    /** Render a frame. Must not mutate logical state. */
    virtual void draw(DisplayManager& display) = 0;

    /** Handle one input event. Return true if consumed (stops propagation). */
    virtual bool onInput(const InputReport& report) { (void)report; return false; }

    virtual void onSleep() {}
    virtual void onWake() {}

    /** If false, the kernel hides the status bar for this app (full-bleed). */
    virtual bool wantsStatusBar() const { return true; }

    /** Health of this app's dependencies, surfaced in Diagnostics. */
    virtual Status health() const { return Status::pass(); }

protected:
    Application() = default;
};

}  // namespace byte_os
