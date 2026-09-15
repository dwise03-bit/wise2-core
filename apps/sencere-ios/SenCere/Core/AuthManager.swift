import SwiftUI

class AuthManager: NSObject, ObservableObject {
  @Published var isAuthenticated = true
  @Published var currentUser: SenCereUser?
  @Published var currentBrand: BrandType = .senCere

  override init() {
    super.init()
    self.currentUser = SenCereUser(
      id: "user-1",
      name: "Team Manager",
      email: "manager@wise2.net",
      avatar: "👤",
      company: "WISE² Management",
      role: "Operations Manager",
      phone: nil
    )
  }

  var currentBrandConfig: BrandConfig {
    BrandConfig.config(for: currentBrand)
  }
}
