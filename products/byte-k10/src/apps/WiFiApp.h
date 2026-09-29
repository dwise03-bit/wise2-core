#pragma once

#include <stdint.h>

#include "Application.h"

namespace byte_os {

class SettingsStore;

/**
 * WiFi: scan, connect, and remember.
 *
 * Two constraints shape this app:
 *
 *  1. Scanning and connecting must never block. WiFi.scanNetworks() takes
 *     seconds; called synchronously it would freeze the render loop. The scan
 *     is started asynchronously and polled, and connection progress is watched
 *     via WiFi.status() rather than waited on.
 *
 *  2. There is no keyboard and no touch. Passwords are entered with a
 *     character picker: tilt up/down changes the character, left/right moves
 *     the cursor, A commits. Slow, but it is the honest interaction this
 *     hardware supports — the alternative would be pretending a keyboard
 *     exists.
 *
 * Credentials for the last successful network are stored in NVS and
 * reconnected automatically.
 */
class WiFiApp final : public Application {
public:
    explicit WiFiApp(SettingsStore& store);

    const char* id() const override    { return "wifi"; }
    const char* title() const override { return "WIFI"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    Status health() const override { return health_; }

    /** Attempt a reconnect using stored credentials. Non-blocking. */
    void autoConnect();

private:
    enum class Mode : uint8_t { List, Password, Connecting, Connected };

    static constexpr uint8_t kMaxNets = 16;
    static constexpr uint8_t kPassMax = 32;
    static constexpr uint8_t kVisible = 8;

    struct Net {
        char    ssid[33];
        int8_t  rssi;
        bool    open;
    };

    SettingsStore& store_;
    Kernel*  kernel_ = nullptr;
    Status   health_;

    Mode     mode_ = Mode::List;
    Net      nets_[kMaxNets];
    uint8_t  netCount_ = 0;
    int8_t   sel_ = 0;
    int8_t   scroll_ = 0;
    bool     scanning_ = false;
    uint32_t scanStartMs_ = 0;
    uint32_t connectStartMs_ = 0;
    char     status_[40] = {0};

    // Password entry state
    char     pass_[kPassMax + 1] = {0};
    uint8_t  passLen_ = 0;
    uint8_t  cursor_ = 0;

    void startScan();
    void pollScan();
    void beginConnect(const char* ssid, const char* pass);
    void drawList(DisplayManager& d);
    void drawPassword(DisplayManager& d);
    void drawConnecting(DisplayManager& d);
};

}  // namespace byte_os
