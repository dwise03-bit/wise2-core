#include "Logger.h"

#include <Arduino.h>
#include <stdarg.h>
#include <stdio.h>
#include <string.h>

namespace byte_os {

Logger& Logger::instance() {
    static Logger inst;
    return inst;
}

void Logger::log(const char* text) {
    if (!text) return;

    char* slot = buf_[head_];
    strncpy(slot, text, kWidth);
    slot[kWidth] = '\0';

    // Strip a trailing newline so the on-screen view does not show a blank row.
    const size_t n = strlen(slot);
    if (n && (slot[n - 1] == '\n' || slot[n - 1] == '\r')) slot[n - 1] = '\0';

    head_ = static_cast<uint8_t>((head_ + 1) % kLines);
    if (count_ < kLines) ++count_;

    Serial.println(slot);
}

void Logger::logf(const char* fmt, ...) {
    char tmp[kWidth + 1];
    va_list ap;
    va_start(ap, fmt);
    vsnprintf(tmp, sizeof(tmp), fmt, ap);
    va_end(ap);
    log(tmp);
}

const char* Logger::line(uint8_t i) const {
    if (i >= count_) return "";
    // Oldest retained line is head_ - count_ (mod kLines) once wrapped.
    const uint8_t start = static_cast<uint8_t>((head_ + kLines - count_) % kLines);
    return buf_[(start + i) % kLines];
}

void Logger::clear() {
    head_ = 0;
    count_ = 0;
}

}  // namespace byte_os
