import SwiftUI

struct AccountView: View {
  @EnvironmentObject var authManager: AuthManager
  @EnvironmentObject var notificationManager: NotificationManager

  var body: some View {
    ZStack {
      Color.blakkhailNavy
        .ignoresSafeArea()

      ScrollView {
        VStack(spacing: 24) {
          // User Profile Header
          VStack(spacing: 12) {
            Circle()
              .fill(
                LinearGradient(
                  gradient: Gradient(colors: [
                    Color.blakkhailGold.opacity(0.2),
                    Color.blakkhailGold.opacity(0.05)
                  ]),
                  startPoint: .topLeading,
                  endPoint: .bottomTrailing
                )
              )
              .frame(width: 80, height: 80)
              .overlay(
                Text("BH")
                  .font(.system(size: 32, weight: .bold))
                  .foregroundColor(.blakkhailGold)
              )

            if let user = authManager.currentUser {
              Text(user.displayName)
                .font(.system(size: 18, weight: .bold))

              Text(user.email)
                .font(.system(size: 13, weight: .light))
                .foregroundColor(.gray)
            }
          }
          .frame(maxWidth: .infinity)
          .padding(24)
          .background(
            RoundedRectangle(cornerRadius: 12)
              .fill(Color.blakkhailNavy.opacity(0.4))
              .stroke(Color.blakkhailGold.opacity(0.2), lineWidth: 1)
          )

          // Preferences
          VStack(spacing: 16) {
            Text("PREFERENCES")
              .font(.system(size: 12, weight: .bold, design: .default))
              .tracking(2)
              .foregroundColor(.blakkhailGold)
              .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 12) {
              HStack {
                VStack(alignment: .leading, spacing: 4) {
                  Text("Drop Notifications")
                    .font(.system(size: 13, weight: .semibold))
                  Text("Get notified of new releases")
                    .font(.system(size: 11, weight: .light))
                    .foregroundColor(.gray)
                }

                Spacer()

                Toggle("", isOn: $notificationManager.isSubscribed)
                  .tint(.blakkhailGold)
              }
              .padding(12)
              .background(Color.blakkhailNavy.opacity(0.4))
              .cornerRadius(8)

              HStack {
                VStack(alignment: .leading, spacing: 4) {
                  Text("Marketing Emails")
                    .font(.system(size: 13, weight: .semibold))
                  Text("Promotions and special offers")
                    .font(.system(size: 11, weight: .light))
                    .foregroundColor(.gray)
                }

                Spacer()

                Toggle("", isOn: .constant(true))
                  .tint(.blakkhailGold)
              }
              .padding(12)
              .background(Color.blakkhailNavy.opacity(0.4))
              .cornerRadius(8)
            }
          }

          // Order History
          VStack(spacing: 16) {
            Text("RECENT ORDERS")
              .font(.system(size: 12, weight: .bold, design: .default))
              .tracking(2)
              .foregroundColor(.blakkhailGold)
              .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 8) {
              OrderItem(
                orderNumber: "BH-2024-001",
                date: "Sep 15, 2026",
                total: 185.50,
                status: "Delivered"
              )

              OrderItem(
                orderNumber: "BH-2024-002",
                date: "Sep 10, 2026",
                total: 125.00,
                status: "Shipped"
              )
            }
          }

          // Help & Support
          VStack(spacing: 16) {
            Text("SUPPORT")
              .font(.system(size: 12, weight: .bold, design: .default))
              .tracking(2)
              .foregroundColor(.blakkhailGold)
              .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 12) {
              SupportLink(icon: "questionmark.circle", text: "FAQ")
              SupportLink(icon: "envelope", text: "Contact Us")
              SupportLink(icon: "shield", text: "Privacy Policy")
              SupportLink(icon: "doc.text", text: "Terms & Conditions")
            }
          }

          // Logout Button
          Button(action: {
            authManager.logout()
          }) {
            Text("SIGN OUT")
              .font(.system(size: 13, weight: .black, design: .default))
              .tracking(1)
              .frame(maxWidth: .infinity)
              .padding(.vertical, 14)
              .background(Color.red.opacity(0.2))
              .foregroundColor(.red)
              .cornerRadius(8)
              .overlay(
                RoundedRectangle(cornerRadius: 8)
                  .stroke(Color.red.opacity(0.5), lineWidth: 1)
              )
          }
        }
        .padding(16)
      }
    }
    .navigationTitle("")
    .navigationBarTitleDisplayMode(.inline)
  }
}

// MARK: - Order Item
struct OrderItem: View {
  let orderNumber: String
  let date: String
  let total: Double
  let status: String

  var statusColor: Color {
    switch status {
    case "Delivered": return .blakkhailNeon
    case "Shipped": return .blakkhailGold
    default: return .gray
    }
  }

  var body: some View {
    HStack(spacing: 12) {
      VStack(alignment: .leading, spacing: 4) {
        Text(orderNumber)
          .font(.system(size: 12, weight: .bold))

        Text(date)
          .font(.system(size: 11, weight: .light))
          .foregroundColor(.gray)
      }

      Spacer()

      VStack(alignment: .trailing, spacing: 4) {
        Text("$\(String(format: "%.2f", total))")
          .font(.system(size: 12, weight: .bold))
          .foregroundColor(.blakkhailGold)

        Text(status)
          .font(.system(size: 10, weight: .semibold))
          .foregroundColor(statusColor)
      }
    }
    .padding(12)
    .background(Color.blakkhailNavy.opacity(0.4))
    .cornerRadius(8)
  }
}

// MARK: - Support Link
struct SupportLink: View {
  let icon: String
  let text: String

  var body: some View {
    Button(action: {}) {
      HStack(spacing: 12) {
        Image(systemName: icon)
          .foregroundColor(.blakkhailGold)
          .frame(width: 24)

        Text(text)
          .font(.system(size: 13, weight: .semibold))
          .foregroundColor(.white)

        Spacer()

        Image(systemName: "chevron.right")
          .font(.system(size: 11, weight: .semibold))
          .foregroundColor(.blakkhailGold.opacity(0.5))
      }
      .padding(12)
      .background(Color.blakkhailNavy.opacity(0.4))
      .cornerRadius(8)
    }
  }
}

#Preview {
  AccountView()
    .environmentObject(AuthManager())
    .environmentObject(NotificationManager())
    .preferredColorScheme(.dark)
}
