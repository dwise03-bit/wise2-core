#pragma once

#include "Application.h"

namespace byte_os {

/**
 * On-device log viewer.
 *
 * The K10's only serial port is USB-CDC, so attaching a monitor resets the
 * board and destroys the boot log you were trying to read. This shows the
 * same log on the panel, with no cable and no reset.
 *
 * Follows the tail by default; scrolling up pins the view so a line does not
 * slide away while you are reading it.
 */
class TerminalApp final : public Application {
public:
    const char* id() const override    { return "terminal"; }
    const char* title() const override { return "TERMINAL"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;

private:
    static constexpr uint8_t kRows = 16;

    Kernel* kernel_ = nullptr;
    int16_t scroll_ = 0;      // 0 = following the tail
    bool    follow_ = true;
};

}  // namespace byte_os
