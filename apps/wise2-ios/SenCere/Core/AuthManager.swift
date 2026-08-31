import SwiftUI

class AuthManager: NSObject, ObservableObject {
  @Published var isAuthenticated = true
  @Published var currentUser: SenCereUser?

  override init() {
    super.init()
    self.currentUser = SenCereUser(
      id: "user-1",
      name: "SenCere Team",
      email: "team@sencere.com",
      avatar: "👥",
      company: "SenCere Creative LLC",
      role: "Creative & Production Manager",
      phone: nil
    )
  }
}
