import SwiftUI

struct SenCerePrimaryButton: View {
  let title: String
  let icon: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Label(title, systemImage: icon)
        .font(.body.weight(.semibold))
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.sencereGold)
        .foregroundColor(.sencereBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
  }
}

struct SenCereSecondaryButton: View {
  let title: String
  let icon: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Label(title, systemImage: icon)
        .font(.body.weight(.medium))
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.sencereSurface)
        .foregroundColor(.sencereTextPrimary)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
          RoundedRectangle(cornerRadius: 14, style: .continuous)
            .stroke(Color.sencereBorder, lineWidth: 1)
        )
    }
  }
}

struct SenCereMetricCard: View {
  let title: String
  let value: String

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(title)
        .font(.caption)
        .foregroundColor(.sencereTextMuted)
      Text(value)
        .font(.title3.weight(.semibold))
        .foregroundColor(.sencereTextPrimary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(16)
    .background(Color.sencereSurface)
    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    .overlay(
      RoundedRectangle(cornerRadius: 16, style: .continuous)
        .stroke(Color.sencereGold.opacity(0.15), lineWidth: 1)
    )
  }
}

struct SenCereBrandRow: View {
  let name: String
  let subtitle: String
  var action: (() -> Void)? = nil

  var body: some View {
    Button {
      action?()
    } label: {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(name)
            .font(.headline)
            .foregroundColor(.sencereGold)
          Text(subtitle)
            .font(.caption)
            .foregroundColor(.sencereTextSecondary)
        }
        Spacer()
        Image(systemName: "chevron.right")
          .font(.caption.weight(.semibold))
          .foregroundColor(.sencereTextMuted)
      }
      .padding(16)
      .background(Color.sencereSurface)
      .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
    .buttonStyle(.plain)
    .disabled(action == nil)
  }
}

struct SenCereScreenBackground: ViewModifier {
  func body(content: Content) -> some View {
    content
      .background(
        ZStack {
          Color.sencereBackground
          RadialGradient(
            colors: [Color.sencereGold.opacity(0.08), .clear],
            center: .top,
            startRadius: 20,
            endRadius: 420
          )
        }
        .ignoresSafeArea()
      )
  }
}

extension View {
  func sencereScreenBackground() -> some View {
    modifier(SenCereScreenBackground())
  }
}
