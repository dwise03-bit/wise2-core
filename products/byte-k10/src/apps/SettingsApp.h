#pragma once

#include <stddef.h>

#include "Application.h"

namespace byte_os {

class SettingsStore;

/**
 * Settings.
 *
 * Tilt up/down moves between rows, tilt left/right changes the highlighted
 * value, A activates (for action rows), B goes back. Changes apply
 * immediately and persist to NVS.
 *
 * Factory Reset requires a deliberate second confirmation, because it is
 * destructive and a stray tilt should never be able to trigger it.
 */
class SettingsApp final : public Application {
public:
    explicit SettingsApp(SettingsStore& store);

    const char* id() const override    { return "settings"; }
    const char* title() const override { return "SETTINGS"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;

private:
    enum Row : uint8_t {
        RowBrightness = 0,
        RowDoze,
        RowSleep,
        RowAnimations,
        RowDeveloper,
        RowFactoryReset,
        RowCount,
    };

    SettingsStore& store_;
    Kernel* kernel_ = nullptr;
    uint8_t sel_ = 0;
    bool    confirmReset_ = false;

    void adjust(int dir);
    void applyToKernel();
    void valueText(uint8_t row, char* out, size_t n) const;
};

}  // namespace byte_os
