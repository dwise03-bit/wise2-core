#pragma once

#include <stddef.h>

#include "Application.h"

namespace byte_os {

/**
 * AI chat.
 *
 * DESIGN NOTE — no endpoint is hardcoded and no reply is ever fabricated.
 * Define BYTE_AI_ENDPOINT (and optionally BYTE_AI_KEY) at build time:
 *
 *   -DBYTE_AI_ENDPOINT='"https://your-host/v1/chat"'
 *   -DBYTE_AI_KEY='"sk-..."'
 *
 * Without an endpoint the app reports UNAVAILABLE and says what is missing.
 * A chat screen that returns canned text would look identical to a working
 * one, which is exactly the failure mode this project keeps hitting.
 *
 * Input is a preset prompt list rather than free text: this board has no
 * keyboard, and driving a character picker through a sentence is unusable.
 * Prompts can include live device state (temperature, uptime), which is the
 * genuinely useful case for an assistant embedded in the hardware.
 *
 * The request runs on a worker task so the 28 FPS render loop never blocks on
 * the network.
 */
class AiChatApp final : public Application {
public:
    const char* id() const override    { return "aichat"; }
    const char* title() const override { return "AI CHAT"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    Status health() const override { return health_; }

private:
    enum class State : uint8_t { NoEndpoint, NoWifi, Picking, Sending, Answered, Failed };

    // uint16_t, not uint8_t: 512 silently wraps to 0 in a uint8_t and
    // declares a zero-length buffer.
    static constexpr uint16_t kReplyMax = 512;

    Kernel*  kernel_ = nullptr;
    Status   health_;
    State    state_ = State::NoEndpoint;
    uint8_t  sel_ = 0;
    char     reply_[kReplyMax] = {0};
    char     error_[64] = {0};
    volatile bool busy_ = false;
    volatile bool done_ = false;
    uint32_t sentMs_ = 0;
    int16_t  replyScroll_ = 0;

    static void workerTrampoline(void* arg);
    void        runRequest();
    const char* promptAt(uint8_t i) const;
    void        buildPrompt(uint8_t i, char* out, size_t n) const;
};

}  // namespace byte_os
