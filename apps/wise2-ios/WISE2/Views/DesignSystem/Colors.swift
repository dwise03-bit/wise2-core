import SwiftUI

// WISE² Design System Colors
extension Color {
  // Background & Surface
  static let wise2Background = Color(red: 0.02, green: 0.02, blue: 0.04)      // #050505
  static let wise2Surface = Color(red: 0.05, green: 0.07, blue: 0.09)         // #0D1117
  static let wise2SurfaceSecondary = Color(red: 0.07, green: 0.10, blue: 0.13) // #131922
  static let wise2Card = Color(red: 0.06, green: 0.08, blue: 0.11)            // #10151D

  // Text & Foreground
  static let wise2TextPrimary = Color.white                                   // #FFFFFF
  static let wise2TextSecondary = Color(red: 0.79, green: 0.81, blue: 0.84)  // #C9CED6
  static let wise2TextMuted = Color(red: 0.55, green: 0.60, blue: 0.65)       // #8D98A5

  // Primary Brand
  static let wise2Primary = Color(red: 0.00, green: 0.58, blue: 1.00)         // #0094FF
  static let wise2PrimaryHover = Color(red: 0.20, green: 0.66, blue: 1.00)    // #32A8FF
  static let wise2PrimaryActive = Color(red: 0.00, green: 0.46, blue: 0.80)   // #0075CC
  static let wise2PrimaryLight = Color(red: 0.10, green: 0.66, blue: 1.00)    // #1AA8FF
  /// Legacy Wealth shell accent (maps to success green).
  static let wise2Accent = Color(red: 0.40, green: 1.00, blue: 0.47)           // #66FF78

  // Semantic Colors
  static let wise2Success = Color(red: 0.13, green: 0.77, blue: 0.37)         // #22C55E
  static let wise2Warning = Color(red: 0.96, green: 0.62, blue: 0.07)         // #F59E0B
  static let wise2Danger = Color(red: 0.90, green: 0.22, blue: 0.21)          // #E53935
  static let wise2Info = Color(red: 0.00, green: 0.58, blue: 1.00)            // #0094FF

  // Borders
  static let wise2BorderSubtle = Color.white.opacity(0.08)
  static let wise2BorderMedium = Color.white.opacity(0.12)
  static let wise2BorderStrong = Color.white.opacity(0.20)

  // Transparent Variants
  static let wise2PrimaryTransparent = Color(red: 0.00, green: 0.58, blue: 1.00).opacity(0.1)
  static let wise2DangerTransparent = Color(red: 0.90, green: 0.22, blue: 0.21).opacity(0.1)
  static let wise2SuccessTransparent = Color(red: 0.13, green: 0.77, blue: 0.37).opacity(0.1)
}
