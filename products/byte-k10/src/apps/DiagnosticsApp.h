#pragma once

#include "Application.h"

class UNIHIKER_K10;
class Music;

namespace byte_os {

/**
 * Developer diagnostics.
 *
 * Runs a real self-test of every subsystem and reports PASS / WARNING /
 * ERROR / UNAVAILABLE per the project rule that nothing is ever assumed
 * healthy. Tests that need hardware we do not have report UNAVAILABLE rather
 * than being quietly skipped or faked green.
 *
 * A is run-all; tilt scrolls the results.
 */
class DiagnosticsApp final : public Application {
public:
    DiagnosticsApp(UNIHIKER_K10& board, Music& music);

    const char* id() const override    { return "diag"; }
    const char* title() const override { return "DIAGNOSTICS"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;

private:
    struct Test {
        const char* name;
        Health      result;
        char        detail[24];
    };

    static constexpr uint8_t kTestCount = 12;

    UNIHIKER_K10& board_;
    Music&   music_;
    Kernel*  kernel_ = nullptr;
    Test     tests_[kTestCount];
    int8_t   running_ = -1;        // index currently under test, -1 = idle
    uint32_t stepMs_  = 0;
    int8_t   scroll_  = 0;

    void resetTests();
    void runStep();
};

}  // namespace byte_os
