import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 32) {
                VStack(spacing: 8) {
                    Text("WISE²")
                        .font(.system(size: 48, weight: .bold, design: .default))
                        .foregroundColor(.cyan)

                    Text("Field Operations")
                        .font(.system(size: 16, weight: .regular))
                        .foregroundColor(.gray)
                }
                .padding(.top, 64)

                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .padding(12)
                        .background(Color.gray.opacity(0.1))
                        .border(Color.cyan, width: 1)
                        .foregroundColor(.white)

                    SecureField("Password", text: $password)
                        .textContentType(.password)
                        .padding(12)
                        .background(Color.gray.opacity(0.1))
                        .border(Color.cyan, width: 1)
                        .foregroundColor(.white)
                }

                if let error = authManager.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }

                Button(action: {
                    Task {
                        await authManager.login(email: email, password: password)
                    }
                }) {
                    if authManager.isLoading {
                        ProgressView()
                            .tint(.black)
                    } else {
                        Text("Login")
                            .font(.system(size: 16, weight: .semibold))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color.cyan)
                .foregroundColor(.black)
                .disabled(authManager.isLoading)

                Spacer()
            }
            .padding(24)
        }
    }
}

#Preview {
    LoginView()
        .environmentObject(AuthManager())
}
