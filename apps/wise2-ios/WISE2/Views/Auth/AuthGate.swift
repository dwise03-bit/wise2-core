import SwiftUI

struct AuthGate: View {
  @EnvironmentObject var authManager: AuthManager
  @State private var isLogin = true

  var body: some View {
    ZStack {
      Color.wise2Background
        .ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 12) {
          Text("WISE²")
            .font(.system(size: 48, weight: .bold, design: .default))
            .foregroundColor(.wise2Primary)

          Text("Command Center")
            .font(.system(size: 16, weight: .regular))
            .foregroundColor(.wise2TextSecondary)
        }
        .padding(.top, 64)
        .padding(.bottom, 48)

        Spacer()

        // Content
        if isLogin {
          LoginView(isLoading: authManager.isLoading, error: authManager.errorMessage) { email, password in
            Task {
              await authManager.login(email: email, password: password)
            }
          }
        } else {
          SignupView(isLoading: authManager.isLoading, error: authManager.errorMessage) { email, password, name in
            Task {
              await authManager.signup(email: email, password: password, name: name)
            }
          }
        }

        Spacer()

        // Toggle
        HStack(spacing: 4) {
          Text(isLogin ? "No account?" : "Have an account?")
            .foregroundColor(.wise2TextSecondary)

          Button(action: { isLogin.toggle() }) {
            Text(isLogin ? "Sign up" : "Log in")
              .foregroundColor(.wise2Primary)
              .fontWeight(.semibold)
          }
        }
        .font(.system(size: 14))
        .padding(.bottom, 48)
      }
      .padding(24)
    }
    .preferredColorScheme(.dark)
  }
}

// MARK: - Login View

struct LoginView: View {
  @State private var email = ""
  @State private var password = ""

  let isLoading: Bool
  let error: String?
  let onLogin: (String, String) async -> Void

  var body: some View {
    VStack(spacing: 20) {
      // Email Field
      VStack(alignment: .leading, spacing: 8) {
        Text("Email")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(.wise2TextMuted)

        TextField("you@example.com", text: $email)
          .textContentType(.emailAddress)
          .keyboardType(.emailAddress)
          .autocorrectionDisabled()
          .textInputAutocapitalization(.never)
          .padding(12)
          .background(Color.wise2Surface)
          .border(Color.wise2BorderMedium, width: 1)
          .foregroundColor(.wise2TextPrimary)
      }

      // Password Field
      VStack(alignment: .leading, spacing: 8) {
        Text("Password")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(.wise2TextMuted)

        SecureField("••••••••", text: $password)
          .textContentType(.password)
          .padding(12)
          .background(Color.wise2Surface)
          .border(Color.wise2BorderMedium, width: 1)
          .foregroundColor(.wise2TextPrimary)
      }

      // Error Message
      if let error = error {
        Text(error)
          .font(.system(size: 12))
          .foregroundColor(.wise2Danger)
          .frame(maxWidth: .infinity, alignment: .leading)
      }

      // Login Button
      Button(action: {
        Task {
          await onLogin(email, password)
        }
      }) {
        HStack(spacing: 8) {
          if isLoading {
            ProgressView()
              .tint(.wise2TextPrimary)
          }
          Text(isLoading ? "Signing in..." : "Sign in")
            .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(Color.wise2Primary)
        .foregroundColor(.wise2TextPrimary)
      }
      .disabled(isLoading || email.isEmpty || password.isEmpty)
    }
  }
}

// MARK: - Signup View

struct SignupView: View {
  @State private var email = ""
  @State private var password = ""
  @State private var name = ""

  let isLoading: Bool
  let error: String?
  let onSignup: (String, String, String) async -> Void

  var body: some View {
    VStack(spacing: 20) {
      // Name Field
      VStack(alignment: .leading, spacing: 8) {
        Text("Full Name")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(.wise2TextMuted)

        TextField("Your name", text: $name)
          .textContentType(.name)
          .padding(12)
          .background(Color.wise2Surface)
          .border(Color.wise2BorderMedium, width: 1)
          .foregroundColor(.wise2TextPrimary)
      }

      // Email Field
      VStack(alignment: .leading, spacing: 8) {
        Text("Email")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(.wise2TextMuted)

        TextField("you@example.com", text: $email)
          .textContentType(.emailAddress)
          .keyboardType(.emailAddress)
          .autocorrectionDisabled()
          .textInputAutocapitalization(.never)
          .padding(12)
          .background(Color.wise2Surface)
          .border(Color.wise2BorderMedium, width: 1)
          .foregroundColor(.wise2TextPrimary)
      }

      // Password Field
      VStack(alignment: .leading, spacing: 8) {
        Text("Password")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(.wise2TextMuted)

        SecureField("••••••••", text: $password)
          .textContentType(.newPassword)
          .padding(12)
          .background(Color.wise2Surface)
          .border(Color.wise2BorderMedium, width: 1)
          .foregroundColor(.wise2TextPrimary)
      }

      // Error Message
      if let error = error {
        Text(error)
          .font(.system(size: 12))
          .foregroundColor(.wise2Danger)
          .frame(maxWidth: .infinity, alignment: .leading)
      }

      // Signup Button
      Button(action: {
        Task {
          await onSignup(email, password, name)
        }
      }) {
        HStack(spacing: 8) {
          if isLoading {
            ProgressView()
              .tint(.wise2TextPrimary)
          }
          Text(isLoading ? "Creating account..." : "Create account")
            .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(Color.wise2Primary)
        .foregroundColor(.wise2TextPrimary)
      }
      .disabled(isLoading || email.isEmpty || password.isEmpty || name.isEmpty)
    }
  }
}

#Preview {
  AuthGate()
    .environmentObject(AuthManager())
}
