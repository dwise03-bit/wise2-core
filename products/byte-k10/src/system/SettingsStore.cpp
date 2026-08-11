#include "SettingsStore.h"

#include <Preferences.h>
#include <string.h>

namespace byte_os {

namespace {
Preferences gPrefs;
constexpr const char* kNamespace = "byte";
}  // namespace

Status SettingsStore::begin() {
    open_ = gPrefs.begin(kNamespace, /*readOnly=*/false);
    if (!open_) return Status::warning("NVS unavailable; settings not persisted");

    brightness_ = gPrefs.getUChar("bright", brightness_);
    if (brightness_ < 51) brightness_ = 255;   // never boot into a black panel
    dozeSec_    = gPrefs.getUShort("doze",   dozeSec_);
    sleepSec_   = gPrefs.getUShort("sleep",  sleepSec_);
    // Historical builds could leave behind arbitrarily small idle timers.
    // Those values make a healthy runtime look "frozen" because BYTE drops
    // straight back into the Sleeping face moments after boot.
    if (dozeSec_ > 0 && dozeSec_ < 15) dozeSec_ = 60;
    if (sleepSec_ > 0 && sleepSec_ < 60) sleepSec_ = 600;
    if (sleepSec_ > 0 && dozeSec_ > 0 && sleepSec_ <= dozeSec_) {
        sleepSec_ = dozeSec_ + 60;
    }
    animations_ = gPrefs.getBool("anim",     animations_);
    developer_  = gPrefs.getBool("dev",      developer_);
    gPrefs.getString("ssid", ssid_, sizeof(ssid_));
    gPrefs.getString("pass", pass_, sizeof(pass_));
    return Status::pass("loaded from NVS");
}

// Guarded writers: NVS is flash-backed with finite write endurance, so a
// no-op assignment must not reach it.
void SettingsStore::putU8(const char* k, uint8_t v)   { if (open_) gPrefs.putUChar(k, v); }
void SettingsStore::putU16(const char* k, uint16_t v) { if (open_) gPrefs.putUShort(k, v); }
void SettingsStore::putBool(const char* k, bool v)    { if (open_) gPrefs.putBool(k, v); }

void SettingsStore::setBrightness(uint8_t v) {
    if (v == brightness_) return;
    brightness_ = v;
    putU8("bright", v);
}

void SettingsStore::setDozeSec(uint16_t v) {
    if (v == dozeSec_) return;
    dozeSec_ = v;
    putU16("doze", v);
}

void SettingsStore::setSleepSec(uint16_t v) {
    if (v == sleepSec_) return;
    sleepSec_ = v;
    putU16("sleep", v);
}

void SettingsStore::setAnimations(bool v) {
    if (v == animations_) return;
    animations_ = v;
    putBool("anim", v);
}

void SettingsStore::setDeveloperMode(bool v) {
    if (v == developer_) return;
    developer_ = v;
    putBool("dev", v);
}

void SettingsStore::setWifi(const char* ssid, const char* pass) {
    if (!ssid) return;
    strncpy(ssid_, ssid, sizeof(ssid_) - 1); ssid_[sizeof(ssid_) - 1] = '\0';
    strncpy(pass_, pass ? pass : "", sizeof(pass_) - 1); pass_[sizeof(pass_) - 1] = '\0';
    if (open_) {
        gPrefs.putString("ssid", ssid_);
        gPrefs.putString("pass", pass_);
    }
}

Status SettingsStore::factoryReset() {
    if (!open_) return Status::warning("NVS unavailable");
    gPrefs.clear();
    brightness_ = 255;
    dozeSec_    = 60;
    sleepSec_   = 600;
    animations_ = true;
    developer_  = false;
    ssid_[0] = pass_[0] = '\0';
    return Status::pass("settings cleared");
}

}  // namespace byte_os
