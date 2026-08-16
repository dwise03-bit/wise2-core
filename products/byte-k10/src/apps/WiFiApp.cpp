#include "WiFiApp.h"

#include <Arduino.h>
#include <WiFi.h>
#include <string.h>
#include <stdio.h>

#include "../core/Kernel.h"
#include "../system/SettingsStore.h"

namespace byte_os {

namespace {
// Character set for the on-screen picker. Ordered so the common cases are
// close together: lowercase, uppercase, digits, then symbols.
const char kCharset[] =
    "abcdefghijklmnopqrstuvwxyz"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "0123456789"
    "!@#$%^&*()-_=+.,:;?/\\[]{}<>~`'\" ";
constexpr uint8_t kCharsetLen = sizeof(kCharset) - 1;

constexpr uint32_t kConnectTimeoutMs = 20000;

int8_t charIndex(char c) {
    for (uint8_t i = 0; i < kCharsetLen; ++i) if (kCharset[i] == c) return static_cast<int8_t>(i);
    return 0;
}
}  // namespace

WiFiApp::WiFiApp(SettingsStore& store) : store_(store) {}

Status WiFiApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    snprintf(status_, sizeof(status_), "idle");
    health_ = store_.hasWifi() ? Status::pass("credentials stored")
                               : Status::warning("no network configured");
    return health_;
}

void WiFiApp::autoConnect() {
    if (!store_.hasWifi()) return;
    Serial.printf("[WIFI] auto-connect to '%s'\n", store_.wifiSsid());
    Serial.flush();
    WiFi.mode(WIFI_STA);
    WiFi.begin(store_.wifiSsid(), store_.wifiPass());
}

void WiFiApp::onEnter() {
    sel_ = scroll_ = 0;
    if (WiFi.status() == WL_CONNECTED) {
        mode_ = Mode::Connected;
        snprintf(status_, sizeof(status_), "%s", WiFi.SSID().c_str());
    } else {
        mode_ = Mode::List;
        startScan();
    }
    if (kernel_) kernel_->face().setState(ByteState::Thinking);
}

void WiFiApp::startScan() {
    if (scanning_) return;
    netCount_ = 0;
    scanning_ = true;
    scanStartMs_ = millis();
    snprintf(status_, sizeof(status_), "scanning...");
    WiFi.scanDelete();
    // async = true: a synchronous scan blocks for seconds and would stall the
    // render loop entirely.
    WiFi.mode(WIFI_STA);            // scanning requires station mode to be up
    // The explicit mode set above matters: without it the scan silently never
    // completes (scanComplete() stays at WIFI_SCAN_RUNNING forever), which
    // looks exactly like a scan that was never started.
    WiFi.scanNetworks(/*async=*/true, /*show_hidden=*/false);
}

void WiFiApp::pollScan() {
    const int16_t n = WiFi.scanComplete();

    if (n == WIFI_SCAN_RUNNING) {
        if (millis() - scanStartMs_ > 15000) {   // stuck scan
            scanning_ = false;
            snprintf(status_, sizeof(status_), "scan timed out");
        }
        return;
    }
    if (n == WIFI_SCAN_FAILED) {
        scanning_ = false;
        snprintf(status_, sizeof(status_), "scan failed");
        return;
    }

    scanning_ = false;
    netCount_ = static_cast<uint8_t>(n > kMaxNets ? kMaxNets : (n < 0 ? 0 : n));
    for (uint8_t i = 0; i < netCount_; ++i) {
        strncpy(nets_[i].ssid, WiFi.SSID(i).c_str(), sizeof(nets_[i].ssid) - 1);
        nets_[i].ssid[sizeof(nets_[i].ssid) - 1] = '\0';
        nets_[i].rssi = static_cast<int8_t>(WiFi.RSSI(i));
        nets_[i].open = (WiFi.encryptionType(i) == WIFI_AUTH_OPEN);
    }
    snprintf(status_, sizeof(status_), "%u network%s", (unsigned)netCount_,
             netCount_ == 1 ? "" : "s");
    WiFi.scanDelete();
    Serial.printf("[WIFI] scan found %u\n", (unsigned)netCount_);
    Serial.flush();
}

void WiFiApp::beginConnect(const char* ssid, const char* pass) {
    mode_ = Mode::Connecting;
    connectStartMs_ = millis();
    snprintf(status_, sizeof(status_), "%s", ssid);
    Serial.printf("[WIFI] connecting to '%s'\n", ssid);
    Serial.flush();
    WiFi.disconnect();
    WiFi.begin(ssid, pass);
}

void WiFiApp::update(uint32_t dtMs) {
    (void)dtMs;

    if (scanning_) pollScan();

    if (mode_ == Mode::Connecting) {
        const wl_status_t st = WiFi.status();
        if (st == WL_CONNECTED) {
            mode_ = Mode::Connected;
            store_.setWifi(WiFi.SSID().c_str(), pass_);   // remember on success
            health_ = Status::pass("connected");
            snprintf(status_, sizeof(status_), "%s", WiFi.SSID().c_str());
            Serial.printf("[WIFI] connected, ip=%s\n", WiFi.localIP().toString().c_str());
            Serial.flush();
            if (kernel_) kernel_->face().setState(ByteState::Happy);
        } else if (millis() - connectStartMs_ > kConnectTimeoutMs) {
            mode_ = Mode::List;
            health_ = Status::error("connect failed");
            snprintf(status_, sizeof(status_), "failed - check password");
            Serial.println("[WIFI] connect timed out");
            Serial.flush();
            if (kernel_) kernel_->face().setState(ByteState::Error);
            WiFi.disconnect();
        }
    }
}

void WiFiApp::drawList(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 8, rowH = 26;
    const int16_t top = DisplayManager::kStatusBarHeight + 6;

    if (netCount_ == 0) {
        d.drawTextAligned(scanning_ ? "scanning..." : "no networks - A to rescan",
                          Rect(0, d.height() / 2 - 8, W, 16),
                          TextAlign::Center, theme::TextMuted, 1);
        return;
    }

    for (uint8_t i = 0; i < kVisible; ++i) {
        const uint8_t idx = static_cast<uint8_t>(i + scroll_);
        if (idx >= netCount_) break;
        const Net& n = nets_[idx];
        const int16_t y = top + i * rowH;
        const bool active = (idx == sel_);

        d.fillRoundRect(pad, y, W - pad * 2, rowH - 3, 5,
                        active ? theme::SurfaceAlt : theme::Surface);
        if (active) d.drawRoundRect(pad, y, W - pad * 2, rowH - 3, 5, theme::Accent);

        d.setTextSize(1);
        d.setTextColor(active ? theme::Accent : theme::TextPrimary);
        d.drawText(n.ssid, pad + 8, y + 8);

        // Signal bars + lock marker
        d.drawWiFi(W - pad - 22, y + 6, n.rssi, true);
        if (!n.open) {
            d.fillRect(W - pad - 34, y + 8, 6, 6, theme::Chrome);
            d.drawRect(W - pad - 33, y + 5, 4, 4, theme::Chrome);
        }
    }

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText(status_, pad, d.height() - 26);
    d.drawText("A: join   B: back   long-A: rescan", pad, d.height() - 14);
}

void WiFiApp::drawPassword(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 10;
    const int16_t top = DisplayManager::kStatusBarHeight + 16;

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText("password for", pad, top);
    d.setTextSize(2);
    d.setTextColor(theme::Accent);
    d.drawText(nets_[sel_].ssid, pad, top + 14);

    // Entry field
    const int16_t fy = top + 52;
    d.fillRoundRect(pad, fy, W - pad * 2, 30, 6, theme::Surface);
    d.setTextSize(2);
    d.setTextColor(theme::TextPrimary);
    char shown[kPassMax + 2];
    for (uint8_t i = 0; i < passLen_; ++i) shown[i] = pass_[i];
    shown[passLen_] = '\0';
    d.drawText(shown, pad + 8, fy + 8);

    // Cursor caret under the active character
    const int16_t cx = pad + 8 + cursor_ * 12;
    d.fillRect(cx, fy + 26, 11, 2, theme::Accent);

    // Big preview of the character currently under the cursor
    const char cur = (cursor_ < passLen_) ? pass_[cursor_] : ' ';
    char one[2] = {cur, '\0'};
    d.fillRoundRect(W / 2 - 26, fy + 46, 52, 52, 8, theme::SurfaceAlt);
    d.setTextSize(4);
    d.setTextColor(theme::Accent);
    d.drawText(one, W / 2 - d.textWidth(one) / 2, fy + 60);

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText("tilt U/D: char   L/R: cursor", pad, d.height() - 26);
    d.drawText("A: connect   B: cancel", pad, d.height() - 14);
}

void WiFiApp::drawConnecting(DisplayManager& d) {
    const int16_t W = d.width();
    if (kernel_) kernel_->face().draw(d, W / 2, 110);

    const bool ok = (mode_ == Mode::Connected);
    d.setTextSize(2);
    d.setTextColor(ok ? theme::Success : theme::Accent);
    const char* hdr = ok ? "CONNECTED" : "CONNECTING";
    d.drawText(hdr, (W - d.textWidth(hdr)) / 2, 196);

    d.setTextSize(1);
    d.setTextColor(theme::TextPrimary);
    d.drawText(status_, (W - d.textWidth(status_)) / 2, 224);

    if (ok) {
        char ip[32];
        snprintf(ip, sizeof(ip), "%s", WiFi.localIP().toString().c_str());
        d.setTextColor(theme::TextMuted);
        d.drawText(ip, (W - d.textWidth(ip)) / 2, 242);

        char rs[24];
        snprintf(rs, sizeof(rs), "%d dBm", (int)WiFi.RSSI());
        d.drawText(rs, (W - d.textWidth(rs)) / 2, 258);
    } else {
        const uint32_t el = (millis() - connectStartMs_) / 1000;
        char t[24];
        snprintf(t, sizeof(t), "%lus", (unsigned long)el);
        d.setTextColor(theme::TextMuted);
        d.drawText(t, (W - d.textWidth(t)) / 2, 242);
    }

    d.setTextSize(1);
    d.setTextColor(theme::TextMuted);
    d.drawText(ok ? "A: forget   B: back" : "B: cancel", 10, d.height() - 14);
}

void WiFiApp::draw(DisplayManager& d) {
    switch (mode_) {
        case Mode::List:       drawList(d); break;
        case Mode::Password:   drawPassword(d); break;
        case Mode::Connecting:
        case Mode::Connected:  drawConnecting(d); break;
    }
}

bool WiFiApp::onInput(const InputReport& r) {
    switch (mode_) {

    case Mode::List:
        if (r.event == InputEvent::NavDown && netCount_) {
            sel_ = static_cast<int8_t>((sel_ + 1) % netCount_);
            if (sel_ >= scroll_ + kVisible) scroll_ = sel_ - kVisible + 1;
            if (sel_ == 0) scroll_ = 0;
            return true;
        }
        if (r.event == InputEvent::NavUp && netCount_) {
            sel_ = static_cast<int8_t>((sel_ - 1 + netCount_) % netCount_);
            if (sel_ < scroll_) scroll_ = sel_;
            if (sel_ == netCount_ - 1) scroll_ = netCount_ > kVisible ? netCount_ - kVisible : 0;
            return true;
        }
        if (r.event == InputEvent::SelectLongPress) { startScan(); return true; }
        if (r.event == InputEvent::SelectPress) {
            if (netCount_ == 0) { startScan(); return true; }
            const Net& n = nets_[sel_];
            if (n.open) { pass_[0] = '\0'; passLen_ = 0; beginConnect(n.ssid, ""); }
            else if (store_.hasWifi() && strcmp(store_.wifiSsid(), n.ssid) == 0) {
                // Known network: reuse the stored password instead of retyping.
                strncpy(pass_, store_.wifiPass(), kPassMax);
                pass_[kPassMax] = '\0';
                passLen_ = static_cast<uint8_t>(strlen(pass_));
                beginConnect(n.ssid, pass_);
            } else {
                mode_ = Mode::Password;
                pass_[0] = kCharset[0]; pass_[1] = '\0';
                passLen_ = 1; cursor_ = 0;
            }
            return true;
        }
        return false;

    case Mode::Password: {
        if (r.event == InputEvent::NavUp || r.event == InputEvent::NavDown) {
            const int8_t dir = (r.event == InputEvent::NavUp) ? -1 : 1;
            int8_t ci = charIndex(pass_[cursor_]) + dir;
            if (ci < 0) ci = kCharsetLen - 1;
            if (ci >= static_cast<int8_t>(kCharsetLen)) ci = 0;
            pass_[cursor_] = kCharset[ci];
            return true;
        }
        if (r.event == InputEvent::NavRight) {
            if (cursor_ + 1 < kPassMax) {
                ++cursor_;
                if (cursor_ >= passLen_) {          // extend
                    pass_[cursor_] = kCharset[0];
                    passLen_ = static_cast<uint8_t>(cursor_ + 1);
                    pass_[passLen_] = '\0';
                }
            }
            return true;
        }
        if (r.event == InputEvent::NavLeft) {
            if (cursor_ > 0) {
                // Moving left off the last character deletes it, which is the
                // only backspace this interface can offer.
                if (cursor_ == passLen_ - 1 && passLen_ > 1) {
                    --passLen_;
                    pass_[passLen_] = '\0';
                }
                --cursor_;
            }
            return true;
        }
        if (r.event == InputEvent::SelectPress) {
            beginConnect(nets_[sel_].ssid, pass_);
            return true;
        }
        if (r.event == InputEvent::BackPress) { mode_ = Mode::List; return true; }
        return false;
    }

    case Mode::Connecting:
        if (r.event == InputEvent::BackPress) {
            WiFi.disconnect();
            mode_ = Mode::List;
            snprintf(status_, sizeof(status_), "cancelled");
            return true;
        }
        return false;

    case Mode::Connected:
        if (r.event == InputEvent::SelectPress) {
            WiFi.disconnect();
            store_.setWifi("", "");
            health_ = Status::warning("no network configured");
            mode_ = Mode::List;
            startScan();
            return true;
        }
        return false;
    }
    return false;
}

}  // namespace byte_os
