import SwiftUI

struct SenCereProfileScreen: View {
  @StateObject private var apiService = SenCereAPIService()
  @State private var isEditing = false

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: 0) {
          // Profile Header
          VStack(spacing: 16) {
            // Avatar
            Circle()
              .fill(Color.sencereGold.opacity(0.2))
              .frame(width: 80, height: 80)
              .overlay(
                Text("👤")
                  .font(.system(size: 40))
              )

            if let user = apiService.currentUser {
              VStack(spacing: 4) {
                Text(user.name)
                  .font(.title2)
                  .fontWeight(.bold)
                  .foregroundColor(.white)
                Text(user.company)
                  .font(.subheadline)
                  .foregroundColor(.gray)
              }

              // User Info Badges
              HStack(spacing: 12) {
                BadgeItem(icon: "✉️", label: user.email)
                BadgeItem(icon: "🎭", label: user.role)
              }
              .padding(16)
            }
          }
          .padding(24)
          .frame(maxWidth: .infinity)
          .background(Color.white.opacity(0.05))

          // Account Settings
          VStack(spacing: 0) {
            SectionHeader(title: "ACCOUNT")

            SettingRow(
              icon: "👤",
              label: "Company Information",
              value: "SenCere Creative LLC"
            )

            SettingRow(
              icon: "📧",
              label: "Email Address",
              value: "team@sencere.com"
            )

            SettingRow(
              icon: "📞",
              label: "Phone Number",
              value: "Add phone number"
            )

            SettingRow(
              icon: "📍",
              label: "Address Book",
              value: "Manage contacts"
            )

            SettingRow(
              icon: "💳",
              label: "Payment Methods",
              value: "Manage payments"
            )
          }
          .padding(.top, 24)

          // Preferences
          VStack(spacing: 0) {
            SectionHeader(title: "PREFERENCES")

            ToggleRow(
              icon: "🔔",
              label: "Push Notifications",
              isOn: true
            )

            ToggleRow(
              icon: "💬",
              label: "Email Updates",
              isOn: true
            )

            SettingRow(
              icon: "🌙",
              label: "Dark Mode",
              value: "On"
            )
          }
          .padding(.top, 24)

          // Security
          VStack(spacing: 0) {
            SectionHeader(title: "SECURITY")

            SettingRow(
              icon: "🔐",
              label: "Change Password",
              value: "Update password"
            )

            SettingRow(
              icon: "🔑",
              label: "Two-Factor Authentication",
              value: "Enabled"
            )

            SettingRow(
              icon: "📱",
              label: "Active Sessions",
              value: "1 device"
            )
          }
          .padding(.top, 24)

          // Support
          VStack(spacing: 0) {
            SectionHeader(title: "SUPPORT")

            SettingRow(
              icon: "❓",
              label: "Help Center",
              value: "View help"
            )

            SettingRow(
              icon: "📖",
              label: "Documentation",
              value: "Read guides"
            )

            SettingRow(
              icon: "💬",
              label: "Contact Support",
              value: "Send message"
            )
          }
          .padding(.top, 24)

          // Logout
          Button(action: {}) {
            HStack {
              Image(systemName: "arrow.right.circle.fill")
              Text("Sign Out")
            }
            .frame(maxWidth: .infinity)
            .padding(14)
            .background(Color.red.opacity(0.1))
            .foregroundColor(.red)
            .fontWeight(.semibold)
            .cornerRadius(8)
          }
          .padding(16)
          .padding(.top, 24)
        }
      }
      .background(Color.black)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarTrailing) {
          Button(action: { isEditing.toggle() }) {
            Image(systemName: "pencil")
              .foregroundColor(.sencereGold)
          }
        }
      }
    }
    .task {
      await apiService.fetchCurrentUser()
    }
  }
}

struct SectionHeader: View {
  let title: String

  var body: some View {
    Text(title)
      .font(.caption)
      .fontWeight(.bold)
      .foregroundColor(.gray)
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.horizontal, 16)
      .padding(.bottom, 12)
  }
}

struct BadgeItem: View {
  let icon: String
  let label: String

  var body: some View {
    HStack(spacing: 6) {
      Text(icon)
        .font(.system(size: 14))
      Text(label)
        .font(.caption)
        .foregroundColor(.gray)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 8)
    .background(Color.white.opacity(0.05))
    .cornerRadius(6)
  }
}

struct SettingRow: View {
  let icon: String
  let label: String
  let value: String

  var body: some View {
    VStack(spacing: 0) {
      HStack(spacing: 12) {
        Text(icon)
          .font(.system(size: 18))

        VStack(alignment: .leading, spacing: 2) {
          Text(label)
            .font(.subheadline)
            .fontWeight(.semibold)
            .foregroundColor(.white)
          Text(value)
            .font(.caption)
            .foregroundColor(.gray)
        }

        Spacer()

        Image(systemName: "chevron.right")
          .font(.caption)
          .foregroundColor(.gray)
      }
      .padding(16)

      Divider()
        .background(Color.white.opacity(0.1))
    }
  }
}

struct ToggleRow: View {
  let icon: String
  let label: String
  @State var isOn: Bool

  var body: some View {
    VStack(spacing: 0) {
      HStack(spacing: 12) {
        Text(icon)
          .font(.system(size: 18))

        Text(label)
          .font(.subheadline)
          .fontWeight(.semibold)
          .foregroundColor(.white)

        Spacer()

        Toggle("", isOn: $isOn)
          .tint(.sencereGold)
      }
      .padding(16)

      Divider()
        .background(Color.white.opacity(0.1))
    }
  }
}

#Preview {
  SenCereProfileScreen()
    .preferredColorScheme(.dark)
}
