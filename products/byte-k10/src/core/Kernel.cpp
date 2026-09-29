#include "Kernel.h"

#include <Arduino.h>
#include <string.h>

#include "../apps/Application.h"

namespace byte_os {

Kernel::Kernel(DisplayManager& display, InputManager& input)
    : display_(display), input_(input) {}

Status Kernel::registerApp(Application* app) {
    if (app == nullptr)          return Status::error("null app");
    if (appCount_ >= kMaxApps)   return Status::error("app table full");
    apps_[appCount_++] = app;
    return Status::pass();
}

Application* Kernel::findApp(const char* id) const {
    if (!id) return nullptr;
    for (uint8_t i = 0; i < appCount_; ++i) {
        if (strcmp(apps_[i]->id(), id) == 0) return apps_[i];
    }
    return nullptr;
}

Status Kernel::begin() {
    if (appCount_ == 0) return Status::error("no apps registered");

    for (uint8_t i = 0; i < appCount_; ++i) {
        const Status s = apps_[i]->initialize(*this);
        Serial.printf("[APP] %-12s %s%s%s\n", apps_[i]->id(), s.label(),
                      s.detail()[0] ? " - " : "", s.detail());
    }

    // First registered app is the root of the navigation stack.
    stack_[0] = apps_[0];
    depth_ = 1;
    stack_[0]->onEnter();

    startMs_ = millis();
    lastTickMs_ = startMs_;
    return Status::pass();
}

Application* Kernel::current() const {
    return depth_ > 0 ? stack_[depth_ - 1] : nullptr;
}

uint32_t Kernel::uptimeSec() const {
    return (millis() - startMs_) / 1000;
}

bool Kernel::launch(const char* id) {
    Application* app = findApp(id);
    if (!app || depth_ >= kMaxDepth) return false;
    if (current() == app) return true;

    if (current()) current()->onExit();
    stack_[depth_++] = app;
    app->onEnter();
    return true;
}

void Kernel::back() {
    if (depth_ <= 1) return;          // already at root
    current()->onExit();
    --depth_;
    current()->onEnter();
}

void Kernel::doze() {
    if (dozing_) return;
    dozing_ = true;
    preDozeState_ = face_.state();
    face_.setState(ByteState::Sleeping);   // screen stays lit
}

void Kernel::sleep() {
    if (asleep_) return;
    asleep_ = true;
    if (current()) current()->onSleep();
    display_.setBrightness(0);
}

void Kernel::wake() {
    if (!asleep_ && !dozing_) return;
    const bool wasAsleep = asleep_;
    asleep_ = false;
    dozing_ = false;
    display_.setBrightness(255);
    face_.setState(preDozeState_ == ByteState::Sleeping ? ByteState::Idle
                                                        : preDozeState_);
    if (wasAsleep && current()) current()->onWake();
}

void Kernel::tick() {
    const uint32_t now = millis();
    uint32_t dt = now - lastTickMs_;
    if (dt == 0) return;
    lastTickMs_ = now;

    // ---- Input -----------------------------------------------------------
    const InputReport ev = input_.poll();
    if (ev) {
        // Every accepted input is logged. Input has regressed twice during
        // bring-up and each time the first question was "did the event even
        // reach the kernel?" - this answers it without another build cycle.
        Serial.printf("[IN] %-10s src=%d hold=%ums app=%s\n",
                      toString(ev.event), (int)ev.source,
                      (unsigned)ev.durationMs,
                      current() ? current()->id() : "-");
        Serial.flush();
        if (asleep_ || dozing_) {
            // Any input wakes a dimmed/sleeping system; that input is consumed
            // by the wake itself so a stray press cannot also trigger an
            // action on a screen the user could not see.
            wake();
        } else if (!current() || !current()->onInput(ev)) {
            // Unconsumed events get the default navigation behaviour.
            if (ev.event == InputEvent::BackPress) back();
        }
    }

    // ---- Idle staging ----------------------------------------------------
    const uint32_t idle = input_.idleMs();
    if (!dozing_ && dozeTimeoutMs_ > 0 && idle >= dozeTimeoutMs_)   doze();
    if (!asleep_ && sleepTimeoutMs_ > 0 && idle >= sleepTimeoutMs_) sleep();

    // With the backlight off there is nothing to see; skip the frame entirely
    // rather than burning ~27ms of SPI per tick on an invisible image.
    if (asleep_) return;

    // ---- Update ----------------------------------------------------------
    face_.update(dt);
    if (current()) current()->update(dt);

    // ---- Draw ------------------------------------------------------------
    display_.beginFrame();
    display_.clear(theme::Background);

    Application* app = current();
    if (app) {
        if (app->wantsStatusBar()) {
            display_.drawStatusBar(app->title(), 255, false, -50, false, false);
        }
        app->draw(display_);
    }

    display_.present();
}

}  // namespace byte_os
