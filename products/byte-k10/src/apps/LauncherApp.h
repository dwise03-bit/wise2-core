#pragma once

#include "Application.h"

namespace byte_os {

/**
 * App launcher.
 *
 * Lists every app the kernel knows about except itself and the root, and
 * launches the highlighted one. Navigation is tilt up/down (or A to select,
 * B to go back), because this board has no touch panel.
 *
 * The list is built from the kernel's registry rather than a hardcoded table,
 * so registering a new app makes it appear here with no changes to this file.
 */
class LauncherApp final : public Application {
public:
    const char* id() const override    { return "launcher"; }
    const char* title() const override { return "APPS"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;

private:
    Kernel* kernel_ = nullptr;
    int8_t  sel_ = 0;
    float   scroll_ = 0.0f;      // smoothed highlight position
    uint8_t visibleCount() const;
    Application* visibleAt(uint8_t i) const;
};

}  // namespace byte_os
