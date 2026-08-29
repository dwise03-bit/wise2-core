import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var notificationsEnabled = true
    @State private var offlineModeEnabled = false
    @State private var cacheExpiration = 60.0

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 16) {
                Text("Settings")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                ScrollView {
                    VStack(spacing: 12) {
                        // Preferences Section
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Preferences")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.gray)
                                .padding(.horizontal)

                            SettingToggle(
                                title: "Notifications",
                                subtitle: "Receive push notifications",
                                isOn: $notificationsEnabled
                            )

                            SettingToggle(
                                title: "Offline Mode",
                                subtitle: "Use cached data when offline",
                                isOn: $offlineModeEnabled
                            )
                        }

                        // Cache Settings
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Cache")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.gray)
                                .padding(.horizontal)

                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text("Expiration")
                                        .font(.system(size: 14))
                                        .foregroundColor(.white)
                                    Spacer()
                                    Text("\(Int(cacheExpiration)) min")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(.cyan)
                                }

                                Slider(value: $cacheExpiration, in: 5...300, step: 5)
                                    .tint(.cyan)
                            }
                            .padding(12)
                            .background(Color.gray.opacity(0.08))
                            .border(Color.cyan.opacity(0.2), width: 1)
                            .padding(.horizontal)
                        }

                        // About Section
                        VStack(alignment: .leading, spacing: 12) {
                            Text("About")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.gray)
                                .padding(.horizontal)

                            SettingRow(label: "App Version", value: "1.0.0")
                            SettingRow(label: "Build", value: "001")
                            SettingRow(label: "Environment", value: "Production")
                        }

                        // User Info Section
                        if let user = authManager.currentUser {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Account")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.gray)
                                    .padding(.horizontal)

                                SettingRow(label: "Email", value: user.email)
                                SettingRow(label: "Name", value: user.name)
                                SettingRow(label: "Role", value: user.role)
                            }
                        }

                        // Logout Button
                        Button(action: {
                            authManager.logout()
                        }) {
                            Text("Logout")
                                .frame(maxWidth: .infinity)
                                .padding(12)
                                .background(Color.red.opacity(0.2))
                                .foregroundColor(.red)
                                .border(Color.red, width: 1)
                        }
                        .padding(.horizontal)
                        .padding(.top, 12)
                    }
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

struct SettingToggle: View {
    let title: String
    let subtitle: String
    @Binding var isOn: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
            }
            Spacer()
            Toggle("", isOn: $isOn)
                .tint(.cyan)
        }
        .padding(12)
        .background(Color.gray.opacity(0.08))
        .border(Color.cyan.opacity(0.2), width: 1)
        .padding(.horizontal)
    }
}

struct SettingRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(.white)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.cyan)
        }
        .padding(12)
        .background(Color.gray.opacity(0.08))
        .border(Color.cyan.opacity(0.2), width: 1)
        .padding(.horizontal)
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthManager())
}
