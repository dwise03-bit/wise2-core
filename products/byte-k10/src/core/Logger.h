#pragma once

#include <stdint.h>

namespace byte_os {

/**
 * Fixed-size log ring buffer.
 *
 * Mirrors what goes to Serial so the device can show its own log without a
 * cable — which matters on a board whose only UART is USB-CDC, so a serial
 * monitor resets it and loses the boot messages you wanted to read.
 *
 * Storage is a flat array of fixed-length lines: no allocation at runtime, so
 * logging can never fragment the heap or fail under pressure. Lines longer
 * than the width are truncated rather than dropped.
 */
class Logger {
public:
    static constexpr uint8_t  kLines = 64;
    static constexpr uint8_t  kWidth = 60;

    static Logger& instance();

    /** printf-style. Also mirrored to Serial. */
    void logf(const char* fmt, ...) __attribute__((format(printf, 2, 3)));
    void log(const char* text);

    /** Number of lines currently held (<= kLines). */
    uint8_t count() const { return count_; }

    /** Line `i` counting 0 = oldest retained. Never null. */
    const char* line(uint8_t i) const;

    void clear();

private:
    Logger() = default;

    char    buf_[kLines][kWidth + 1] = {};
    uint8_t head_ = 0;     // next write slot
    uint8_t count_ = 0;
};

}  // namespace byte_os
