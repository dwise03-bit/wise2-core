#pragma once

#include "Application.h"

namespace byte_os {

/**
 * Bluetooth LE scanner.
 *
 * Scans are run in short bursts and polled, never blocking the render loop.
 * The ESP32-S3 has no classic Bluetooth — BLE only — so this deliberately
 * does not offer a classic pairing UI that the silicon cannot support.
 */
class BluetoothApp final : public Application {
public:
    const char* id() const override    { return "bluetooth"; }
    const char* title() const override { return "BLUETOOTH"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void onExit() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    Status health() const override { return health_; }

private:
    static constexpr uint8_t kMaxDev = 20;
    static constexpr uint8_t kVisible = 9;

    struct Dev {
        char    name[24];
        char    addr[18];
        int8_t  rssi;
    };

    Kernel*  kernel_ = nullptr;
    Status   health_;
    Dev      devs_[kMaxDev];
    uint8_t  count_ = 0;
    int8_t   sel_ = 0;
    int8_t   scroll_ = 0;
    bool     scanning_ = false;
    bool     started_ = false;
    uint32_t scanStartMs_ = 0;

    void startScan();
    void collect();
};

}  // namespace byte_os
