#pragma once

#include "Application.h"

namespace byte_os {

/**
 * microSD file browser.
 *
 * No card present is reported as UNAVAILABLE, not as an error — an empty slot
 * is a normal state, and the distinction matters when reading Diagnostics.
 *
 * Directory contents are read once on entry and on navigation, never in
 * draw(): SD access is SPI on the same bus as the display and must not sit in
 * the render path.
 */
class FilesApp final : public Application {
public:
    const char* id() const override    { return "files"; }
    const char* title() const override { return "FILES"; }

    Status initialize(Kernel& kernel) override;
    void onEnter() override;
    void draw(DisplayManager& display) override;
    bool onInput(const InputReport& report) override;
    Status health() const override { return health_; }

private:
    static constexpr uint8_t kMaxEntries = 32;
    static constexpr uint8_t kVisible = 9;
    static constexpr uint8_t kPathMax = 96;

    struct Entry {
        char     name[40];
        uint32_t size;
        bool     dir;
    };

    Kernel*  kernel_ = nullptr;
    Status   health_;
    bool     mounted_ = false;
    Entry    entries_[kMaxEntries];
    uint8_t  count_ = 0;
    int8_t   sel_ = 0;
    int8_t   scroll_ = 0;
    char     path_[kPathMax] = "/";
    uint64_t cardBytes_ = 0;

    bool mount();
    void readDir();
    void enter();
    void up();
};

}  // namespace byte_os
