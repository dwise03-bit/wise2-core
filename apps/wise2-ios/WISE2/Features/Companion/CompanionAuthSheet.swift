import SwiftUI

/// Optional WISE² sign-in for companion owners who want Sales dashboard access.
struct CompanionAuthSheet: View {
  @EnvironmentObject var authManager: AuthManager
  @Environment(\.dismiss) private var dismiss
  @State private var isLogin = true

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: 24) {
          VStack(spacing: 8) {
            Text("Owner sign-in")
              .font(.title2.weight(.semibold))
              .foregroundColor(.wise2TextPrimary)
            Text("Optional — unlock Sales pipeline and revenue metrics.")
              .font(.subheadline)
              .foregroundColor(.wise2TextSecondary)
              .multilineTextAlignment(.center)
          }
          .padding(.top, 8)

          if isLogin {
            LoginView(
              isLoading: authManager.isLoading,
              error: authManager.errorMessage,
              onLogin: { email, password in
                await authManager.login(email: email, password: password)
                if authManager.isAuthenticated {
                  dismiss()
                }
              },
              onOperatorPreview: {
                await authManager.enterOperatorPreview()
                dismiss()
              }
            )
          } else {
            SignupView(isLoading: authManager.isLoading, error: authManager.errorMessage) { email, password, name in
              await authManager.signup(email: email, password: password, name: name)
              if authManager.isAuthenticated {
                dismiss()
              }
            }
          }

          HStack(spacing: 4) {
            Text(isLogin ? "No account?" : "Have an account?")
              .foregroundColor(.wise2TextSecondary)
            Button(isLogin ? "Sign up" : "Log in") { isLogin.toggle() }
              .foregroundColor(.wise2Gold)
              .fontWeight(.semibold)
          }
          .font(.footnote)
        }
        .padding(20)
      }
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationTitle("Account")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Close") { dismiss() }
          }
      }
    }
    .preferredColorScheme(.dark)
  }
}
