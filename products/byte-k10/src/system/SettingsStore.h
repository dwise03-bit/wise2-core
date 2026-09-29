#pragma once

#include <stdint.h>

#include "../core/Status.h"

namespace byte_os {

/**
 * Persisted device settings, backed by NVS via Preferences.
 *
 * Values are cached in RAM and only written when they actually change —
 * NVS is flash-backed and has finite endurance, so writing an unchanged value
 * every frame would wear it out.
 */
class SettingsStore {
public:
    Status begin();

    uint8_t brightness() const     { return brightness_; }
    void setBrightness(uint8_t v);

    /** Idle seconds before BYTE dozes (screen stays lit). 0 = never. */
    uint16_t dozeSec() const       { return dozeSec_; }
    void setDozeSec(uint16_t v);

    /** Idle seconds before the backlight turns off. 0 = never. */
    uint16_t sleepSec() const      { return sleepSec_; }
    void setSleepSec(uint16_t v);

    bool animations() const        { return animations_; }
    void setAnimations(bool v);

    bool developerMode() const     { return developer_; }
    void setDeveloperMode(bool v);

    /** Last successfully-joined network. Empty ssid = none stored. */
    const char* wifiSsid() const { return ssid_; }
    const char* wifiPass() const { return pass_; }
    void setWifi(const char* ssid, const char* pass);
    bool hasWifi() const { return ssid_[0] != '\0'; }

    /** Wipe all stored settings and restore defaults. */
    Status factoryReset();

private:
    bool     open_       = false;
    uint8_t  brightness_ = 255;
    uint16_t dozeSec_    = 60;
    uint16_t sleepSec_   = 600;
    bool     animations_ = true;
    bool     developer_  = false;
    char     ssid_[33] = {0};
    char     pass_[65] = {0};

    void putU8(const char* k, uint8_t v);
    void putU16(const char* k, uint16_t v);
    void putBool(const char* k, bool v);
};

}  // namespace byte_os
