import SwiftUI

struct BrandSwitcher: View {
  @ObservedObject var authManager: AuthManager
  @State private var showBrandMenu = false

  let config: BrandConfig

  var body: some View {
    HStack(spacing: 8) {
      // Brand Logo
      Text(config.logo)
        .font(.system(size: 24))

      // Brand Name
      VStack(alignment: .leading, spacing: 2) {
        Text(config.name)
          .font(.headline)
          .fontWeight(.bold)
          .foregroundColor(.white)
        Text(config.description)
          .font(.caption2)
          .foregroundColor(.gray)
      }

      Spacer()

      // Switcher Button
      Menu {
        ForEach(BrandConfig.allBrands, id: \.id) { brand in
          Button(action: {
            authManager.currentBrand = brand.id
          }) {
            HStack {
              Text(brand.logo)
              Text(brand.name)
              if brand.id == authManager.currentBrand {
                Image(systemName: "checkmark.circle.fill")
              }
            }
          }
        }
      } label: {
        Image(systemName: "arrow.triangle.swap")
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(config.primaryColor)
          .padding(8)
          .background(Color.white.opacity(0.1))
          .cornerRadius(6)
      }
    }
    .padding(16)
    .background(Color.white.opacity(0.05))
    .cornerRadius(12)
  }
}

#Preview {
  BrandSwitcher(
    authManager: AuthManager(),
    config: BrandConfig.senCere
  )
  .preferredColorScheme(.dark)
}
