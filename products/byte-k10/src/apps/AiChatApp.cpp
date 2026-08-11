#include "AiChatApp.h"

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <stdio.h>
#include <string.h>

#include "../core/Kernel.h"
#include "../core/Logger.h"

#ifndef BYTE_AI_ENDPOINT
#define BYTE_AI_ENDPOINT ""
#endif
#ifndef BYTE_AI_KEY
#define BYTE_AI_KEY ""
#endif

namespace byte_os {

namespace {
const char* kEndpoint = BYTE_AI_ENDPOINT;
const char* kApiKey   = BYTE_AI_KEY;

// Preset prompts. Entries marked withState get live device readings appended,
// which is the case where an on-device assistant beats a phone.
struct Preset { const char* label; bool withState; };
const Preset kPresets[] = {
    {"How are my sensors?",        true },
    {"Summarise device status",    true },
    {"What can you do?",           false},
    {"Tell me something useful",   false},
};
constexpr uint8_t kPresetCount = sizeof(kPresets) / sizeof(kPresets[0]);

AiChatApp* gApp = nullptr;
char gPrompt[256];

bool endpointConfigured() { return kEndpoint && kEndpoint[0] != '\0'; }

/**
 * Pull a plain-text answer out of a JSON body without a JSON parser.
 *
 * Deliberately tolerant: it looks for the common reply keys used by chat
 * APIs and falls back to the raw body. Parsing properly would mean pulling in
 * ArduinoJson and committing to one provider's schema, which is premature
 * before the endpoint is even chosen.
 */
void extractReply(const String& body, char* out, size_t n) {
    static const char* keys[] = {"\"content\":\"", "\"text\":\"", "\"reply\":\"", "\"response\":\""};
    for (const char* k : keys) {
        const int at = body.indexOf(k);
        if (at < 0) continue;
        const int start = at + static_cast<int>(strlen(k));
        size_t o = 0;
        for (int i = start; i < static_cast<int>(body.length()) && o < n - 1; ++i) {
            const char c = body[i];
            if (c == '\\' && i + 1 < static_cast<int>(body.length())) {
                const char e = body[++i];
                if (e == 'n') { out[o++] = ' '; continue; }
                if (e == '"' || e == '\\' || e == '/') { out[o++] = e; continue; }
                continue;
            }
            if (c == '"') break;
            out[o++] = c;
        }
        out[o] = '\0';
        if (o) return;
    }
    strncpy(out, body.c_str(), n - 1);
    out[n - 1] = '\0';
}
}  // namespace

Status AiChatApp::initialize(Kernel& kernel) {
    kernel_ = &kernel;
    gApp = this;
    if (!endpointConfigured()) {
        state_ = State::NoEndpoint;
        health_ = Status::unavailable("no endpoint configured");
    } else {
        state_ = State::NoWifi;
        health_ = Status::pass("endpoint configured");
    }
    return health_;
}

void AiChatApp::onEnter() {
    replyScroll_ = 0;
    if (!endpointConfigured())            state_ = State::NoEndpoint;
    else if (WiFi.status() != WL_CONNECTED) state_ = State::NoWifi;
    else                                   state_ = State::Picking;
    if (kernel_) kernel_->face().setState(ByteState::Idle);
}

const char* AiChatApp::promptAt(uint8_t i) const {
    return i < kPresetCount ? kPresets[i].label : "";
}

void AiChatApp::buildPrompt(uint8_t i, char* out, size_t n) const {
    if (i >= kPresetCount) { out[0] = '\0'; return; }

    if (!kPresets[i].withState || !kernel_) {
        snprintf(out, n, "%s", kPresets[i].label);
        return;
    }
    int ax = 0, ay = 0, az = 0;
    kernel_->input().acceleration(ax, ay, az);
    snprintf(out, n,
             "%s Device state: uptime %lus, free heap %luKB, "
             "accelerometer %d/%d/%d, wifi %s.",
             kPresets[i].label,
             (unsigned long)kernel_->uptimeSec(),
             (unsigned long)(ESP.getFreeHeap() / 1024),
             ax, ay, az,
             WiFi.status() == WL_CONNECTED ? "connected" : "offline");
}

void AiChatApp::workerTrampoline(void* arg) {
    static_cast<AiChatApp*>(arg)->runRequest();
    vTaskDelete(nullptr);
}

void AiChatApp::runRequest() {
    HTTPClient http;
    http.setTimeout(15000);
    if (!http.begin(kEndpoint)) {
        snprintf(error_, sizeof(error_), "bad endpoint URL");
        done_ = true; busy_ = false;
        return;
    }
    http.addHeader("Content-Type", "application/json");
    if (kApiKey && kApiKey[0]) {
        String auth = "Bearer ";
        auth += kApiKey;
        http.addHeader("Authorization", auth);
    }

    // Minimal, provider-agnostic body. Escape quotes so a prompt containing
    // them cannot produce malformed JSON.
    String body = "{\"prompt\":\"";
    for (const char* p = gPrompt; *p; ++p) {
        if (*p == '"' || *p == '\\') body += '\\';
        body += *p;
    }
    body += "\"}";

    const int code = http.POST(body);
    if (code > 0 && code < 400) {
        extractReply(http.getString(), reply_, sizeof(reply_));
        error_[0] = '\0';
    } else {
        snprintf(error_, sizeof(error_), "HTTP %d", code);
        reply_[0] = '\0';
    }
    http.end();

    done_ = true;
    busy_ = false;
}

void AiChatApp::update(uint32_t dtMs) {
    (void)dtMs;
    if (state_ == State::NoWifi && WiFi.status() == WL_CONNECTED) state_ = State::Picking;

    if (state_ == State::Sending && done_) {
        done_ = false;
        state_ = (error_[0] == '\0') ? State::Answered : State::Failed;
        if (kernel_) {
            kernel_->face().setState(state_ == State::Answered ? ByteState::Talking
                                                               : ByteState::Error);
        }
        Logger::instance().logf("[AI] %s", error_[0] ? error_ : "reply received");
    }
}

void AiChatApp::draw(DisplayManager& d) {
    const int16_t W = d.width();
    constexpr int16_t pad = 10;
    const int16_t top = DisplayManager::kStatusBarHeight + 10;

    switch (state_) {

    case State::NoEndpoint:
        d.setTextSize(2);
        d.setTextColor(theme::Warning);
        d.drawText("NOT CONFIGURED", pad, top);
        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        d.drawText("No AI endpoint is set, so there", pad, top + 30);
        d.drawText("is nothing to talk to.", pad, top + 42);
        d.setTextColor(theme::TextMuted);
        d.drawText("Build with:", pad, top + 66);
        d.drawText("-DBYTE_AI_ENDPOINT='\"https://", pad, top + 82);
        d.drawText("  your-host/v1/chat\"'", pad, top + 94);
        d.drawText("-DBYTE_AI_KEY='\"...\"'  (optional)", pad, top + 110);
        d.drawText("Replies are never faked, so this", pad, top + 134);
        d.drawText("app stays inert until pointed at", pad, top + 146);
        d.drawText("a real service.", pad, top + 158);
        break;

    case State::NoWifi:
        d.setTextSize(2);
        d.setTextColor(theme::TextMuted);
        d.drawText("OFFLINE", pad, top);
        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        d.drawText("Join a network in the WiFi app.", pad, top + 30);
        break;

    case State::Picking: {
        d.setTextSize(1);
        d.setTextColor(theme::TextMuted);
        d.drawText("choose a prompt", pad, top);
        for (uint8_t i = 0; i < kPresetCount; ++i) {
            const int16_t y = top + 18 + i * 34;
            const bool active = (i == sel_);
            d.fillRoundRect(pad, y, W - pad * 2, 30, 6,
                            active ? theme::SurfaceAlt : theme::Surface);
            if (active) d.drawRoundRect(pad, y, W - pad * 2, 30, 6, theme::Accent);
            d.setTextSize(1);
            d.setTextColor(active ? theme::Accent : theme::TextPrimary);
            d.drawText(promptAt(i), pad + 10, y + 12);
        }
        d.setTextColor(theme::TextMuted);
        d.drawText("tilt: pick   A: ask   B: back", pad, d.height() - 14);
        break;
    }

    case State::Sending: {
        if (kernel_) kernel_->face().draw(d, W / 2, 110);
        d.setTextSize(2);
        d.setTextColor(theme::Accent);
        d.drawText("THINKING", (W - d.textWidth("THINKING")) / 2, 190);
        char t[24];
        snprintf(t, sizeof(t), "%lus", (unsigned long)((millis() - sentMs_) / 1000));
        d.setTextSize(1);
        d.setTextColor(theme::TextMuted);
        d.drawText(t, (W - d.textWidth(t)) / 2, 218);
        break;
    }

    case State::Answered: {
        // Wrap the reply to the panel width, honouring the scroll offset.
        constexpr uint8_t cols = 38, rows = 18;
        const size_t len = strlen(reply_);
        const uint16_t totalRows = static_cast<uint16_t>((len + cols - 1) / cols);
        d.setTextSize(1);
        for (uint8_t r = 0; r < rows; ++r) {
            const uint16_t lineIdx = static_cast<uint16_t>(replyScroll_ + r);
            if (lineIdx >= totalRows) break;
            char lineBuf[cols + 1];
            const size_t off = static_cast<size_t>(lineIdx) * cols;
            size_t k = 0;
            while (k < cols && off + k < len) { lineBuf[k] = reply_[off + k]; ++k; }
            lineBuf[k] = '\0';
            d.setTextColor(theme::TextPrimary);
            d.drawText(lineBuf, pad, top + r * 12);
        }
        d.setTextColor(theme::TextMuted);
        d.drawText("tilt: scroll   A: ask again   B: back", pad, d.height() - 14);
        break;
    }

    case State::Failed:
        d.setTextSize(2);
        d.setTextColor(theme::Danger);
        d.drawText("FAILED", pad, top);
        d.setTextSize(1);
        d.setTextColor(theme::TextPrimary);
        d.drawText(error_, pad, top + 30);
        d.setTextColor(theme::TextMuted);
        d.drawText("A: retry   B: back", pad, d.height() - 14);
        break;
    }
}

bool AiChatApp::onInput(const InputReport& r) {
    switch (state_) {

    case State::Picking:
        if (r.event == InputEvent::NavDown) { sel_ = static_cast<uint8_t>((sel_ + 1) % kPresetCount); return true; }
        if (r.event == InputEvent::NavUp)   { sel_ = static_cast<uint8_t>((sel_ + kPresetCount - 1) % kPresetCount); return true; }
        if (r.event == InputEvent::SelectPress && !busy_) {
            buildPrompt(sel_, gPrompt, sizeof(gPrompt));
            reply_[0] = error_[0] = '\0';
            replyScroll_ = 0;
            busy_ = true; done_ = false;
            state_ = State::Sending;
            sentMs_ = millis();
            if (kernel_) kernel_->face().setState(ByteState::Thinking);
            Logger::instance().logf("[AI] asking: %.40s", gPrompt);
            // Network I/O on its own task: HTTPClient blocks for seconds and
            // must never sit in the render loop.
            xTaskCreatePinnedToCore(&AiChatApp::workerTrampoline, "ai_req",
                                    8192, this, 2, nullptr, 1);
            return true;
        }
        return false;

    case State::Answered:
        if (r.event == InputEvent::NavDown) { ++replyScroll_; return true; }
        if (r.event == InputEvent::NavUp)   { if (replyScroll_ > 0) --replyScroll_; return true; }
        if (r.event == InputEvent::SelectPress) { state_ = State::Picking; return true; }
        return false;

    case State::Failed:
        if (r.event == InputEvent::SelectPress) { state_ = State::Picking; return true; }
        return false;

    default:
        return false;
    }
}

}  // namespace byte_os
