import SwiftUI

struct AuthenticationView: View {
  @EnvironmentObject var authManager: AuthManager
  @State private var isLogin = true
  @State private var email = ""
  @State private var password = ""
  @State private var displayName = ""

  var body: some View {
    ZStack {
      Color.blakkhailNavy
        .ignoresSafeArea()

      ScrollView {
        VStack(spacing: 40) {
          // Logo/Header
          VStack(spacing: 12) {
            Text("BH")
              .font(.system(size: 48, weight: .black, design: .default))
              .foregroundColor(.blakkhailGold)
              .shadow(color: .blakkhailGold.opacity(0.4), radius: 15, x: 0, y: 0)

            Text("BLAKK HAIL")
              .font(.system(size: 16, weight: .bold, design: .default))
              .tracking(2)
              .foregroundColor(.blakkhailGold)

            Text("Take Control")
              .font(.system(size: 12, weight: .light))
              .foregroundColor(.gray)
              .tracking(1)
          }
          .frame(maxWidth: .infinity)
          .padding(.vertical, 40)

          // Auth Form
          VStack(spacing: 24) {
            // Tab Toggle
            HStack(spacing: 0) {
              Button(action: { isLogin = true }) {
                Text("LOGIN")
                  .font(.system(size: 12, weight: .bold, design: .default))
                  .tracking(1)
                  .frame(maxWidth: .infinity)
                  .padding(.vertical, 12)
                  .foregroundColor(isLogin ? .blakkhailNavy : .blakkhailGold)
                  .background(isLogin ? Color.blakkhailGold : Color.clear)
                  .cornerRadius(4, corners: [.topLeft, .bottomLeft])
              }

              Button(action: { isLogin = false }) {
                Text("SIGNUP")
                  .font(.system(size: 12, weight: .bold, design: .default))
                  .tracking(1)
                  .frame(maxWidth: .infinity)
                  .padding(.vertical, 12)
                  .foregroundColor(!isLogin ? .blakkhailNavy : .blakkhailGold)
                  .background(!isLogin ? Color.blakkhailGold : Color.clear)
                  .cornerRadius(4, corners: [.topRight, .bottomRight])
              }
            }
            .background(Color.blakkhailNavy.opacity(0.6))
            .cornerRadius(4)

            // Form Fields
            VStack(spacing: 16) {
              if !isLogin {
                TextField("Display Name", text: $displayName)
                  .textFieldStyle(.plain)
                  .padding(12)
                  .background(Color.blakkhailNavy.opacity(0.6))
                  .foregroundColor(.white)
                  .cornerRadius(4)
                  .overlay(
                    RoundedRectangle(cornerRadius: 4)
                      .stroke(Color.blakkhailGold.opacity(0.3), lineWidth: 1)
                  )
              }

              TextField("Email", text: $email)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color.blakkhailNavy.opacity(0.6))
                .foregroundColor(.white)
                .cornerRadius(4)
                .overlay(
                  RoundedRectangle(cornerRadius: 4)
                    .stroke(Color.blakkhailGold.opacity(0.3), lineWidth: 1)
                )

              SecureField("Password", text: $password)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color.blakkhailNavy.opacity(0.6))
                .foregroundColor(.white)
                .cornerRadius(4)
                .overlay(
                  RoundedRectangle(cornerRadius: 4)
                    .stroke(Color.blakkhailGold.opacity(0.3), lineWidth: 1)
                )
            }

            // Submit Button
            Button(action: {
              Task {
                if isLogin {
                  await authManager.login(email: email, password: password)
                } else {
                  await authManager.signup(email: email, password: password, displayName: displayName)
                }
              }
            }) {
              if authManager.isLoading {
                ProgressView()
                  .tint(.blakkhailNavy)
              } else {
                Text(isLogin ? "SIGN IN" : "CREATE ACCOUNT")
                  .font(.system(size: 12, weight: .black, design: .default))
                  .tracking(1)
              }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.blakkhailNeon)
            .foregroundColor(.blakkhailNavy)
            .cornerRadius(4)
            .disabled(authManager.isLoading || email.isEmpty || password.isEmpty)

            // Error Message
            if let error = authManager.error {
              Text(error)
                .font(.system(size: 12, weight: .light))
                .foregroundColor(.red)
                .multilineTextAlignment(.center)
            }
          }
          .padding(20)
          .background(
            RoundedRectangle(cornerRadius: 12)
              .fill(Color.blakkhailNavy.opacity(0.4))
              .stroke(Color.blakkhailGold.opacity(0.2), lineWidth: 1)
          )

          // Demo Credentials
          VStack(spacing: 8) {
            Text("Demo Account")
              .font(.system(size: 11, weight: .bold))
              .tracking(1)
              .foregroundColor(.blakkhailGold)

            VStack(alignment: .leading, spacing: 4) {
              Text("Email: demo@blakkhail.com")
                .font(.system(size: 11, weight: .light))
              Text("Password: Demo123!")
                .font(.system(size: 11, weight: .light))
            }
            .foregroundColor(.gray)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(Color.blakkhailNavy.opacity(0.6))
            .cornerRadius(4)
          }
        }
        .padding(20)
      }
    }
  }
}

// MARK: - Corner Radius Modifier
extension View {
  func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
    clipShape(RoundedCorner(radius: radius, corners: corners))
  }
}

struct RoundedCorner: Shape {
  var radius: CGFloat = .infinity
  var corners: UIRectCorner = .allCorners

  func path(in rect: CGRect) -> Path {
    let path = UIBezierPath(roundedRect: rect,
                           byRoundingCorners: corners,
                           cornerRadii: CGSize(width: radius, height: radius))
    return Path(path.cgPath)
  }
}

#Preview {
  AuthenticationView()
    .environmentObject(AuthManager())
    .preferredColorScheme(.dark)
}
