import Foundation

/// Switches between full WISE² Business Controller and SenCere Client Companion UI.
enum AppFlavor {
  /// Client-facing companion: shop, sales, connect — no full ops stack.
  static var isClientCompanion: Bool {
    if ProcessInfo.processInfo.environment["WISE2_FULL_CONTROLLER"] == "1" {
      return false
    }
    if ProcessInfo.processInfo.environment["CLIENT_COMPANION"] == "1" {
      return true
    }
    if let flag = Bundle.main.object(forInfoDictionaryKey: "WISE2ClientCompanion") as? Bool {
      return flag
    }
    return false
  }
}
