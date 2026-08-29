import SwiftUI

struct WISEGauge: View {
    let value: Double
    let minimum: Double
    let maximum: Double
    let unit: String
    let title: String
    let accentColor: Color

    @State private var animatedValue: Double = 0

    var body: some View {
        VStack(spacing: WISESpacing.sm) {
            // Gauge Circle
            ZStack {
                // Background circle
                Circle()
                    .stroke(WISEColor.surfaceSecondary, lineWidth: 2)

                // Track circle
                Circle()
                    .trim(from: 0.0, to: CGFloat(progress))
                    .stroke(
                        LinearGradient(
                            gradient: Gradient(colors: [accentColor, accentColor.opacity(0.6)]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.5), value: animatedValue)

                // Center value
                VStack(spacing: 2) {
                    Text(String(format: "%.1f", animatedValue))
                        .font(WISETypography.measurementMedium)
                        .foregroundColor(WISEColor.textPrimary)
                        .monospacedDigit()

                    Text(unit)
                        .font(WISETypography.caption)
                        .foregroundColor(WISEColor.textSecondary)
                }
            }
            .frame(height: 140)
            .padding(WISESpacing.md)

            // Title and stats
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(WISETypography.caption)
                    .foregroundColor(WISEColor.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: WISESpacing.sm) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("MIN")
                            .font(WISETypography.captionSmall)
                            .foregroundColor(WISEColor.textMuted)
                        Text(String(format: "%.1f", minimum))
                            .font(WISETypography.body)
                            .foregroundColor(WISEColor.textSecondary)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("MAX")
                            .font(WISETypography.captionSmall)
                            .foregroundColor(WISEColor.textMuted)
                        Text(String(format: "%.1f", maximum))
                            .font(WISETypography.body)
                            .foregroundColor(WISEColor.textSecondary)
                    }
                }
            }
            .padding(.horizontal, WISESpacing.md)
            .padding(.bottom, WISESpacing.md)
        }
        .wisePanelStyle()
        .onAppear {
            animatedValue = value
        }
        .onChange(of: value) { newValue in
            animatedValue = newValue
        }
    }

    private var progress: Double {
        let range = maximum - minimum
        return (animatedValue - minimum) / range
    }
}

#Preview {
    ZStack {
        WISEColor.bgPrimary.ignoresSafeArea()

        VStack(spacing: WISESpacing.lg) {
            WISEGauge(
                value: 68.4,
                minimum: 0,
                maximum: 120,
                unit: "PSIG",
                title: "LOW SIDE",
                accentColor: WISEColor.electricBlue
            )

            WISEGauge(
                value: 248.7,
                minimum: 0,
                maximum: 600,
                unit: "PSIG",
                title: "HIGH SIDE",
                accentColor: WISEColor.faultRed
            )
        }
        .padding(WISESpacing.lg)
    }
}
