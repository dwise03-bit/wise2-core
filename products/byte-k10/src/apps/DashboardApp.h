#pragma once

#include "Application.h"

class UNIHIKER_K10;

namespace byte_os {

/**
 * BYTE's home screen.
 *
 * Shows live readings from the K10's onboard sensors that are safe for the
 * current bring-up path. Temperature/humidity is temporarily omitted in the
 * demo build while the display pipeline is being stabilised on real hardware.
 *
 * Battery is deliberately reported as "n/a": the K10 has a PH2.0 battery
 * connector but DFRobot documents no battery-sense ADC and the SDK exposes no
 * API for it, so there is nothing truthful to display. Showing a fabricated
 * percentage would be worse than showing none.
 */
class DashboardApp final : public Application {
public:
    explicit DashboardApp(UNIHIKER_K10& board);

    const char* id() const override    { return "dashboard"; }
    const char* title() const override { return "BYTE"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    bool wantsStatusBar() const override { return false; }
    Status health() const override { return health_; }

private:
    UNIHIKER_K10& board_;
    Kernel*       kernel_ = nullptr;
    Status        health_;

    // Cached sensor values. Sensor reads are I2C and must never happen in
    // draw() — they are refreshed on a timer in update().
    float    tempC_    = 0.0f;
    float    humidity_ = 0.0f;
    uint16_t lux_      = 0;
    int      ax_ = 0, ay_ = 0, az_ = 0;
    bool     haveAht_  = false;
    bool     luxOk_    = false;
    uint32_t lastSensorMs_ = 0;
    uint32_t lastAhtRetryMs_ = 0;

    /** Crash-safe replacement for the SDK's readALS(). See the .cpp. */
    uint16_t readLuxSafe();

    void drawCard(DisplayManager& d, Rect box, const char* label,
                  const char* value, Color valueColor);
};

}  // namespace byte_os
