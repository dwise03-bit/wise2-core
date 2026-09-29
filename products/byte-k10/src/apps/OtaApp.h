#pragma once

#include "Application.h"

namespace byte_os {

/**
 * Over-the-air firmware update.
 *
 * IMPORTANT — this board cannot OTA as shipped. DFRobot's only partition
 * scheme (large_spiffs_16MB) declares a single `factory` app partition with
 * no `otadata` and no ota_0/ota_1 slots, because the remaining flash is given
 * to the AI model (4.5 MB) and TTS voice (2.5 MB) images:
 *
 *     nvs        data nvs      0x9000   0x5000
 *     factory    app  factory  0x10000  0x500000
 *     model      data spiffs   0x510000 4563k
 *     voice_data data fat      0x985000 2542k
 *
 * esp_ota_get_next_update_partition() therefore returns NULL and any OTA
 * write fails. This app detects that at runtime and reports UNAVAILABLE with
 * the reason, rather than presenting an update button that cannot work.
 *
 * When a dual-slot table IS flashed, the same app runs ArduinoOTA for real:
 * it advertises on the network and shows live progress.
 */
class OtaApp final : public Application {
public:
    const char* id() const override    { return "ota"; }
    const char* title() const override { return "OTA UPDATE"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void onExit() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    Status health() const override { return health_; }

private:
    enum class State : uint8_t { NoPartition, NoWifi, Ready, Receiving, Done, Failed };

    Kernel*  kernel_ = nullptr;
    Status   health_;
    State    state_ = State::NoPartition;
    bool     armed_ = false;          // ArduinoOTA.begin() called
    uint8_t  progress_ = 0;
    char     detail_[64] = {0};

    // Partition facts, read from the running image.
    bool     otaCapable_ = false;
    uint32_t runningSize_ = 0;
    uint32_t sketchSize_  = 0;
    char     runningName_[20] = {0};

    void probePartitions();
    void arm();
};

}  // namespace byte_os
