import SwiftUI

struct SectionLabel: View {
  let title: String

  var body: some View {
    Text(title)
      .font(.headline.weight(.semibold))
      .foregroundColor(.wise2TextPrimary)
      .textCase(.uppercase)
      .tracking(0.5)
  }
}

#Preview {
  SectionLabel(title: "Executive Metrics")
}
