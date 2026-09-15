import SwiftUI

struct SenCereEmblemView: View {
  var size: CGFloat = 160
  var showGlow: Bool = true

  var body: some View {
    ZStack {
      if showGlow {
        Circle()
          .fill(
            RadialGradient(
              colors: [Color.sencereGold.opacity(0.35), .clear],
              center: .center,
              startRadius: size * 0.1,
              endRadius: size * 0.65
            )
          )
          .frame(width: size * 1.15, height: size * 1.15)
      }

      Image("SenCereEmblem")
        .resizable()
        .scaledToFill()
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(
          Circle()
            .stroke(Color.sencereGold.opacity(0.45), lineWidth: max(1, size * 0.012))
        )
        .shadow(color: .black.opacity(0.45), radius: size * 0.12, y: size * 0.06)
    }
    .accessibilityLabel("SenCere bunny emblem")
  }
}
