import SwiftUI

struct SenCereShopScreen: View {
  var body: some View {
    SenCereSafariView(url: SenCereBrand.shopURL)
      .ignoresSafeArea()
      .navigationTitle("Blakk Hail")
      .navigationBarTitleDisplayMode(.inline)
  }
}
