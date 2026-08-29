import SwiftUI

// MARK: - WISE² Design System
// Professional HVAC diagnostic instrumentation palette & typography

enum WISEColor {
    // BACKGROUNDS
    static let bgPrimary = Color(red: 0.008, green: 0.016, blue: 0.024)      // #020406
    static let bgSecondary = Color(red: 0.020, green: 0.031, blue: 0.043)    // #05080B
    static let bgTertiary = Color(red: 0.031, green: 0.047, blue: 0.063)     // #080C10

    // SURFACES
    static let surfacePrimary = Color(red: 0.043, green: 0.063, blue: 0.078)    // #0B1014
    static let surfaceSecondary = Color(red: 0.051, green: 0.075, blue: 0.094)  // #0D1318
    static let surfaceTertiary = Color(red: 0.067, green: 0.094, blue: 0.125)   // #111820

    // ACCENT COLORS
    static let wiseGreen = Color(red: 0.216, green: 1.0, blue: 0.447)        // #37FF72
    static let wiseGreenDark = Color(red: 0.125, green: 0.910, blue: 0.365)  // #20E85D

    static let electricBlue = Color(red: 0.180, green: 0.549, blue: 1.0)     // #2E8CFF
    static let electricBlueLite = Color(red: 0.349, green: 0.718, blue: 1.0) // #59B7FF

    static let warningAmber = Color(red: 1.0, green: 0.789, blue: 0.157)     // #FFC928
    static let faultRed = Color(red: 1.0, green: 0.271, blue: 0.227)         // #FF453A

    static let purple = Color(red: 0.659, green: 0.408, blue: 1.0)           // #A968FF

    // TEXT
    static let textPrimary = Color(red: 0.957, green: 0.969, blue: 0.976)    // #F4F7F9
    static let textSecondary = Color(red: 0.616, green: 0.659, blue: 0.698)  // #9DA8B2
    static let textMuted = Color(red: 0.376, green: 0.416, blue: 0.447)      // #606A72

    // METALLIC
    static let metalLight = Color(red: 0.538, green: 0.576, blue: 0.616)     // #89939D
    static let metalMid = Color(red: 0.737, green: 0.773, blue: 0.804)       // #BCC5CD
    static let metalDark = Color(red: 0.882, green: 0.902, blue: 0.922)      // #E1E6EB
}

enum WISETypography {
    // MARK: Font Styles

    static let logoTitle: Font = .system(size: 32, weight: .black, design: .default)
    static let screenTitle: Font = .system(size: 28, weight: .bold, design: .default)
    static let sectionTitle: Font = .system(size: 18, weight: .semibold, design: .default)
    static let bodyLarge: Font = .system(size: 16, weight: .semibold, design: .default)
    static let body: Font = .system(size: 14, weight: .regular, design: .default)
    static let bodyMedium: Font = .system(size: 14, weight: .medium, design: .default)
    static let caption: Font = .system(size: 12, weight: .medium, design: .default)
    static let captionSmall: Font = .system(size: 11, weight: .regular, design: .default)

    // MEASUREMENT NUMBERS
    static let measurementLarge: Font = .system(size: 48, weight: .bold, design: .monospaced)
    static let measurementMedium: Font = .system(size: 32, weight: .semibold, design: .monospaced)
    static let measurementSmall: Font = .system(size: 20, weight: .semibold, design: .monospaced)

    static let diagnostic: Font = .system(size: 13, weight: .regular, design: .monospaced)
}

enum WISESpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
}

enum WISECornerRadius {
    static let sm: CGFloat = 6
    static let md: CGFloat = 8
    static let lg: CGFloat = 12
    static let xl: CGFloat = 16
}

// MARK: - Custom Style Modifiers

extension View {
    func wisePanelStyle(highlighted: Bool = false) -> some View {
        self
            .padding(WISESpacing.md)
            .background(
                RoundedRectangle(cornerRadius: WISECornerRadius.md)
                    .fill(highlighted ? WISEColor.surfaceSecondary : WISEColor.surfacePrimary)
            )
            .overlay(
                RoundedRectangle(cornerRadius: WISECornerRadius.md)
                    .stroke(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                WISEColor.wiseGreen.opacity(highlighted ? 0.3 : 0.1),
                                WISEColor.electricBlue.opacity(highlighted ? 0.2 : 0.05)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
    }

    func wiseButtonStyle(accent: Color = WISEColor.wiseGreen) -> some View {
        self
            .padding(.vertical, WISESpacing.sm)
            .padding(.horizontal, WISESpacing.md)
            .background(accent.opacity(0.15))
            .foregroundColor(accent)
            .cornerRadius(WISECornerRadius.sm)
            .overlay(
                RoundedRectangle(cornerRadius: WISECornerRadius.sm)
                    .stroke(accent.opacity(0.3), lineWidth: 0.5)
            )
    }

    func measurementText() -> some View {
        self.font(WISETypography.measurementMedium)
            .foregroundColor(WISEColor.textPrimary)
            .monospacedDigit()
    }
}
