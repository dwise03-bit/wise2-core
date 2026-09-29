import SwiftUI

struct CompanionShopScreen: View {
  var body: some View {
    CompanionSafariView(url: SenCereBrand.shopURL)
      .ignoresSafeArea()
      .navigationTitle("Blakk Hail Shop")
      .navigationBarTitleDisplayMode(.inline)
  }
}

#Preview {
  NavigationStack {
    CompanionShopScreen()
  }
}
