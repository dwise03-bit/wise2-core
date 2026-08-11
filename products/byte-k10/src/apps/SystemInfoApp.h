#pragma once

#include <stddef.h>

#include "Application.h"

namespace byte_os {

/**
 * System information — every field read from the running chip, none hardcoded.
 * Tilt up/down scrolls; the list is longer than the panel.
 */
class SystemInfoApp final : public Application {
public:
    const char* id() const override    { return "sysinfo"; }
    const char* title() const override { return "SYSTEM"; }

    Status initialize(Kernel& kernel) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;

private:
    Kernel* kernel_ = nullptr;
    int8_t  scroll_ = 0;

    static constexpr uint8_t kRows = 17;
    void rowText(uint8_t i, char* key, size_t kn, char* val, size_t vn) const;
};

}  // namespace byte_os
