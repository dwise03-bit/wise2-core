#pragma once

#include "Application.h"

class UNIHIKER_K10;
class Music;

namespace byte_os {

/**
 * Voice: live microphone level, speech-driven mouth, and speaker output.
 *
 * The two MEMS microphones and the 2 W speaker share one I2S peripheral, and
 * the SDK guards it with xI2SMutex — capture and playback cannot overlap. This
 * app therefore stops metering while a tone is playing rather than fighting
 * for the bus.
 *
 * Voice Activity Detection here is an energy gate with an adaptive noise
 * floor, not a trained model: it tracks the ambient level and treats a
 * sustained rise above it as speech. That is honest about what it is — it will
 * trigger on any loud sound, not only a voice.
 */
class VoiceApp final : public Application {
public:
    VoiceApp(UNIHIKER_K10& board, Music& music);

    const char* id() const override    { return "voice"; }
    const char* title() const override { return "VOICE"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void onExit() override;
    void update(uint32_t dtMs) override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    Status health() const override { return health_; }

private:
    enum class AudioMode : uint8_t {
        Live = 0,
        Cue,
        Recording,
        Playback,
    };

    enum class Action : uint8_t {
        SpeakerCue = 0,
        RecordTake,
        PlayTake,
    };

    UNIHIKER_K10& board_;
    Music&        music_;
    Kernel*       kernel_ = nullptr;
    Status        health_;
    AudioMode     mode_   = AudioMode::Live;
    Action        sel_    = Action::SpeakerCue;

    float    level_      = 0.0f;   // smoothed 0..1
    float    peak_       = 0.0f;   // decaying peak marker
    float    noiseFloor_ = 0.0f;   // adaptive ambient baseline
    uint64_t rawLevel_   = 0;
    bool     speaking_   = false;
    uint32_t speechMs_   = 0;      // how long speech has been continuous
    uint32_t lastSampleMs_ = 0;
    bool     sdMounted_  = false;
    bool     takeAvailable_ = false;
    volatile bool recording_ = false;
    uint32_t busyUntilMs_ = 0;
    uint32_t takeMs_ = 0;
    uint32_t history_[48] = {0};   // rolling level history for the waveform
    uint8_t  histIdx_    = 0;
    char     status_[40] = "live meter";

    bool mountCard();
    void refreshTakeState();
    void beginCue();
    void beginRecord();
    void beginPlayback();
    void stopAudio();
    const char* actionLabel(Action action) const;
    static void recordTask(void* arg);
};

}  // namespace byte_os
