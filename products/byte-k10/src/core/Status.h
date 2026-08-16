#pragma once

#include <stdint.h>

namespace byte_os {

/**
 * Health of a subsystem after initialization or a self-test.
 *
 * Every subsystem reports one of these. `Unavailable` is deliberately distinct
 * from `Error`: it means the hardware genuinely is not present on this board
 * (for example, the K10 has no touch panel). Reporting `Unavailable` is always
 * preferred over inventing a plausible value.
 */
enum class Health : uint8_t {
    Pass = 0,
    Warning,
    Error,
    Unavailable,
};

/**
 * Result of a subsystem operation.
 *
 * `detail` points at a string literal with static storage duration — subsystems
 * report fixed diagnostic strings, so no allocation or ownership is involved.
 */
class Status {
public:
    constexpr Status() noexcept : health_(Health::Pass), detail_("") {}
    constexpr Status(Health health, const char* detail) noexcept
        : health_(health), detail_(detail ? detail : "") {}

    static constexpr Status pass(const char* detail = "") noexcept {
        return Status(Health::Pass, detail);
    }
    static constexpr Status warning(const char* detail) noexcept {
        return Status(Health::Warning, detail);
    }
    static constexpr Status error(const char* detail) noexcept {
        return Status(Health::Error, detail);
    }
    static constexpr Status unavailable(const char* detail) noexcept {
        return Status(Health::Unavailable, detail);
    }

    constexpr Health health() const noexcept { return health_; }
    constexpr const char* detail() const noexcept { return detail_; }

    /** True only for Pass. A Warning subsystem runs but is degraded. */
    constexpr bool ok() const noexcept { return health_ == Health::Pass; }

    /** True if the subsystem can be used at all (Pass or Warning). */
    constexpr bool usable() const noexcept {
        return health_ == Health::Pass || health_ == Health::Warning;
    }

    const char* label() const noexcept {
        switch (health_) {
            case Health::Pass:        return "PASS";
            case Health::Warning:     return "WARNING";
            case Health::Error:       return "ERROR";
            case Health::Unavailable: return "UNAVAILABLE";
        }
        return "UNKNOWN";
    }

private:
    Health health_;
    const char* detail_;
};

}  // namespace byte_os
