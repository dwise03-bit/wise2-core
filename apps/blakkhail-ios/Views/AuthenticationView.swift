import SwiftUI

struct AuthenticationView: View {
  @State var email = ""
  @State var password = ""
  @State var isLoading = false
  @State var errorMessage = ""
  @State var isAuthenticated = false

  var body: some View {
    ZStack {
      // Premium dark background with gradient
      LinearGradient(
        gradient: Gradient(colors: [
          Color(#colorLiteral(red: 0.02, green: 0.02, blue: 0.05, alpha: 1)), // Navy #050607
          Color(#colorLiteral(red: 0.05, green: 0.03, blue: 0.08, alpha: 1))  // Deep navy
        ]),
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
      .ignoresSafeArea()

      // Accent glow effects
      Circle()
        .fill(
          RadialGradient(
            gradient: Gradient(colors: [
              Color(#colorLiteral(red: 0.00, green: 0.85, blue: 1.0, alpha: 0.15)), // Cyan
              Color.clear
            ]),
            center: .topTrailing,
            startRadius: 0,
            endRadius: 300
          )
        )
        .frame(width: 400, height: 400)
        .offset(x: 100, y: -150)

      Circle()
        .fill(
          RadialGradient(
            gradient: Gradient(colors: [
              Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 0.1)), // Gold
              Color.clear
            ]),
            center: .bottomLeading,
            startRadius: 0,
            endRadius: 300
          )
        )
        .frame(width: 400, height: 400)
        .offset(x: -100, y: 200)

      VStack(spacing: 0) {
        ScrollView {
          VStack(spacing: 32) {
            // BLAKKHAIL Logo/Header
            VStack(spacing: 12) {
              // Logo circle with "B"
              ZStack {
                Circle()
                  .stroke(Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 0.6)), lineWidth: 2)
                  .frame(width: 80, height: 80)

                Text("B")
                  .font(.system(size: 48, weight: .black, design: .default))
                  .foregroundColor(Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 1))) // Gold
                  .tracking(2)
              }
              .padding(.top, 24)

              Text("BLAKKHAIL")
                .font(.system(size: 28, weight: .black, design: .default))
                .foregroundColor(Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 1))) // Gold
                .tracking(1.5)

              Text("HERITAGE")
                .font(.system(size: 12, weight: .bold, design: .default))
                .foregroundColor(Color(#colorLiteral(red: 0.00, green: 0.85, blue: 1.0, alpha: 0.8))) // Cyan
                .tracking(2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)

            // Tagline
            Text("Original streetwear culture\nbuilt on legacy, authenticity,\nand no apologies.")
              .font(.system(size: 14, weight: .light, design: .default))
              .foregroundColor(Color(#colorLiteral(red: 0.8, green: 0.8, blue: 0.8, alpha: 0.7)))
              .multilineTextAlignment(.center)
              .tracking(0.5)
              .lineSpacing(4)

            // Email input
            VStack(alignment: .leading, spacing: 8) {
              Text("EMAIL")
                .font(.system(size: 11, weight: .bold, design: .default))
                .foregroundColor(Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 0.7)))
                .tracking(1)

              TextField("", text: $email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .padding(12)
                .background(Color(#colorLiteral(red: 0.05, green: 0.08, blue: 0.15, alpha: 1)))
                .cornerRadius(6)
                .overlay(
                  RoundedRectangle(cornerRadius: 6)
                    .stroke(Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 0.3)), lineWidth: 1)
                )
                .foregroundColor(.white)
            }

            // Password input
            VStack(alignment: .leading, spacing: 8) {
              Text("PASSWORD")
                .font(.system(size: 11, weight: .bold, design: .default))
                .foregroundColor(Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 0.7)))
                .tracking(1)

              SecureField("", text: $password)
                .textContentType(.password)
                .padding(12)
                .background(Color(#colorLiteral(red: 0.05, green: 0.08, blue: 0.15, alpha: 1)))
                .cornerRadius(6)
                .overlay(
                  RoundedRectangle(cornerRadius: 6)
                    .stroke(Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 0.3)), lineWidth: 1)
                )
                .foregroundColor(.white)
            }

            // Error message
            if !errorMessage.isEmpty {
              Text(errorMessage)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(Color(#colorLiteral(red: 1.0, green: 0.3, blue: 0.3, alpha: 1)))
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color(#colorLiteral(red: 0.2, green: 0.05, blue: 0.05, alpha: 0.5)))
                .cornerRadius(6)
            }

            // Sign In Button
            Button(action: handleLogin) {
              HStack(spacing: 8) {
                if isLoading {
                  ProgressView()
                    .tint(.white)
                } else {
                  Text("SIGN IN")
                    .font(.system(size: 13, weight: .black, design: .default))
                    .tracking(1)
                }
              }
              .frame(maxWidth: .infinity)
              .padding(.vertical, 14)
              .background(
                LinearGradient(
                  gradient: Gradient(colors: [
                    Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 1)),  // Gold
                    Color(#colorLiteral(red: 0.65, green: 0.52, blue: 0.28, alpha: 1))   // Darker gold
                  ]),
                  startPoint: .topLeading,
                  endPoint: .bottomTrailing
                )
              )
              .foregroundColor(Color(#colorLiteral(red: 0.02, green: 0.02, blue: 0.05, alpha: 1))) // Navy text
              .cornerRadius(6)
              .shadow(color: Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 0.3)), radius: 12, x: 0, y: 8)
            }
            .disabled(email.isEmpty || password.isEmpty || isLoading)
            .opacity(email.isEmpty || password.isEmpty ? 0.5 : 1.0)

            // Footer links
            VStack(spacing: 12) {
              Button(action: {}) {
                Text("Forgot password?")
                  .font(.system(size: 12, weight: .semibold))
                  .foregroundColor(Color(#colorLiteral(red: 0.00, green: 0.85, blue: 1.0, alpha: 0.7)))
              }

              Divider()
                .background(Color(#colorLiteral(red: 0.77, green: 0.64, blue: 0.41, alpha: 0.2)))

              Button(action: {}) {
                Text("Create account")
                  .font(.system(size: 12, weight: .semibold))
                  .foregroundColor(Color(#colorLiteral(red: 0.00, green: 1.0, blue: 0.50, alpha: 0.7)))
              }
            }
            .padding(.top, 12)
            .padding(.bottom, 24)
          }
          .padding(.horizontal, 24)
        }
      }
    }
  }

  func handleLogin() {
    isLoading = true
    errorMessage = ""

    // Email validation
    let emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailPattern)
    let isValidEmail = emailPredicate.evaluate(with: email)

    // Simulate API authentication
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
      // Demo credentials
      if email.lowercased() == "demo@blakkhail.com" && password == "password123" {
        isAuthenticated = true
      } else if !isValidEmail {
        errorMessage = "Please enter a valid email address"
        isLoading = false
      } else if password.isEmpty {
        errorMessage = "Password is required"
        isLoading = false
      } else if password.count < 6 {
        errorMessage = "Password must be at least 6 characters"
        isLoading = false
      } else {
        errorMessage = "Invalid email or password"
        isLoading = false
      }
    }
  }
}

#Preview {
  AuthenticationView()
    .preferredColorScheme(.dark)
}
