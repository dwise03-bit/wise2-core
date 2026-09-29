import SwiftUI

struct CommandOrb: View {
  var action: () -> Void

  var body: some View {
    Button(action: action) {
      ZStack {
        Circle()
          .fill(
            RadialGradient(
              colors: [Color.wise2Primary.opacity(0.35), Color.wise2Background.opacity(0.05)],
              center: .center,
              startRadius: 4,
              endRadius: 34
            )
          )
          .frame(width: 58, height: 58)
          .overlay(
            Circle()
              .stroke(Color.wise2Primary.opacity(0.55), lineWidth: 1.5)
          )
        Image(systemName: "command.circle.fill")
          .font(.system(size: 28, weight: .semibold))
          .foregroundColor(.wise2Primary)
      }
      .shadow(color: Color.wise2Primary.opacity(0.25), radius: 10, y: 4)
    }
    .buttonStyle(.plain)
    .accessibilityLabel("WISE² Command")
    .accessibilityHint("Open universal command entry")
  }
}
