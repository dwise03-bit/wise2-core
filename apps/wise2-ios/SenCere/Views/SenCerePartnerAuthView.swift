import SwiftUI

/// Partner sign-in for silent investor portal (WISE² backend).
struct SenCerePartnerAuthView: View {
  @EnvironmentObject var authManager: AuthManager
  @Environment(\.dismiss) private var dismiss
  @State private var email = ""
  @State private var password = ""
  @State private var isSignup = false
  @State private var name = ""

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: 24) {
          SenCereEmblemView(size: 120)
          VStack(spacing: 8) {
            Text("Partner Portal")
              .font(.title2.weight(.semibold))
              .foregroundColor(.sencereTextPrimary)
            Text("Silent investor access to SenCere performance metrics.")
              .font(.subheadline)
              .foregroundColor(.sencereTextSecondary)
              .multilineTextAlignment(.center)
          }

          if isSignup {
            authField("Full name", text: $name, contentType: .name)
          }
          authField("Email", text: $email, contentType: .emailAddress, keyboard: .emailAddress)
          authSecureField("Password", text: $password)

          if let error = authManager.errorMessage {
            Text(error)
              .font(.caption)
              .foregroundColor(.sencereDanger)
              .frame(maxWidth: .infinity, alignment: .leading)
          }

          Button {
            Task {
              if isSignup {
                await authManager.signup(email: email, password: password, name: name)
              } else {
                await authManager.login(email: email, password: password)
              }
              if authManager.isAuthenticated { dismiss() }
            }
          } label: {
            HStack {
              if authManager.isLoading { ProgressView().tint(.sencereBackground) }
              Text(authManager.isLoading ? "Please wait…" : (isSignup ? "Create partner account" : "Sign in"))
                .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.sencereGold)
            .foregroundColor(.sencereBackground)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
          }
          .disabled(authManager.isLoading || email.isEmpty || password.isEmpty || (isSignup && name.isEmpty))

          Button(isSignup ? "Already have access? Sign in" : "Need an account? Sign up") {
            isSignup.toggle()
            authManager.errorMessage = nil
          }
          .font(.footnote.weight(.semibold))
          .foregroundColor(.sencereGold)

          Text(SenCereBrand.poweredByFooter)
            .font(.caption2)
            .foregroundColor(.sencereTextMuted)
            .multilineTextAlignment(.center)
        }
        .padding(24)
      }
      .sencereScreenBackground()
      .navigationTitle("Partner Access")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Close") { dismiss() }
        }
      }
    }
  }

  private func authField(
    _ label: String,
    text: Binding<String>,
    contentType: UITextContentType,
    keyboard: UIKeyboardType = .default
  ) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(label)
        .font(.caption.weight(.semibold))
        .foregroundColor(.sencereTextMuted)
      TextField(label, text: text)
        .textContentType(contentType)
        .keyboardType(keyboard)
        .autocorrectionDisabled()
        .textInputAutocapitalization(.never)
        .padding(12)
        .background(Color.sencereSurface)
        .foregroundColor(.sencereTextPrimary)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.sencereBorder))
    }
  }

  private func authSecureField(_ label: String, text: Binding<String>) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(label)
        .font(.caption.weight(.semibold))
        .foregroundColor(.sencereTextMuted)
      SecureField(label, text: text)
        .textContentType(isSignup ? .newPassword : .password)
        .padding(12)
        .background(Color.sencereSurface)
        .foregroundColor(.sencereTextPrimary)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.sencereBorder))
    }
  }
}
