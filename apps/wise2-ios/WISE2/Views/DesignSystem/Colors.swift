import SwiftUI

// WISE² Design System Colors
extension Color {
  static let wise2Background = Color(red: 0.02, green: 0.02, blue: 0.04)
  static let wise2Surface = Color(red: 0.05, green: 0.07, blue: 0.09)
  static let wise2SurfaceSecondary = Color(red: 0.07, green: 0.10, blue: 0.13)
  static let wise2Card = Color(red: 0.06, green: 0.08, blue: 0.11)

  static let wise2TextPrimary = Color.white
  static let wise2TextSecondary = Color(red: 0.79, green: 0.81, blue: 0.84)
  static let wise2TextMuted = Color(red: 0.55, green: 0.60, blue: 0.65)

  static let wise2Primary = Color(red: 0.00, green: 0.58, blue: 1.00)
  static let wise2PrimaryHover = Color(red: 0.20, green: 0.66, blue: 1.00)
  static let wise2PrimaryActive = Color(red: 0.00, green: 0.46, blue: 0.80)
  static let wise2PrimaryLight = Color(red: 0.10, green: 0.66, blue: 1.00)

  // WISE² HVAC / field accent
  static let wise2ElectricGreen = Color(red: 0.31, green: 1.00, blue: 0.28)
  static let wise2ElectricGreenDim = Color(red: 0.12, green: 0.55, blue: 0.15)

  static let wise2Success = Color(red: 0.13, green: 0.77, blue: 0.37)
  static let wise2Warning = Color(red: 0.96, green: 0.62, blue: 0.07)
  static let wise2Danger = Color(red: 0.90, green: 0.22, blue: 0.21)
  static let wise2Info = Color(red: 0.00, green: 0.58, blue: 1.00)

  static let wise2BorderSubtle = Color.white.opacity(0.08)
  static let wise2BorderMedium = Color.white.opacity(0.12)
  static let wise2BorderStrong = Color.white.opacity(0.20)

  static let wise2PrimaryTransparent = Color(red: 0.00, green: 0.58, blue: 1.00).opacity(0.1)
  static let wise2DangerTransparent = Color(red: 0.90, green: 0.22, blue: 0.21).opacity(0.1)
  static let wise2SuccessTransparent = Color(red: 0.13, green: 0.77, blue: 0.37).opacity(0.1)
}
