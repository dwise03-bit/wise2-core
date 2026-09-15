import SwiftUI

struct CartView: View {
  @EnvironmentObject var cartManager: CartManager
  @State private var showCheckout = false

  var body: some View {
    ZStack {
      Color.blakkhailNavy
        .ignoresSafeArea()

      if cartManager.items.isEmpty {
        VStack(spacing: 20) {
          Image(systemName: "bag")
            .font(.system(size: 48, weight: .light))
            .foregroundColor(.blakkhailGold)

          Text("Your cart is empty")
            .font(.system(size: 18, weight: .bold))
            .foregroundColor(.white)

          Text("Add items from the shop to get started")
            .font(.system(size: 13, weight: .light))
            .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
      } else {
        VStack(spacing: 0) {
          // Header
          VStack(spacing: 8) {
            Text("YOUR CART")
              .font(.system(size: 24, weight: .black, design: .default))
              .tracking(-0.3)
              .foregroundColor(.blakkhailGold)
          }
          .frame(maxWidth: .infinity)
          .padding(20)
          .background(
            LinearGradient(
              gradient: Gradient(colors: [
                Color.blakkhailGold.opacity(0.05),
                Color.clear
              ]),
              startPoint: .topLeading,
              endPoint: .bottomTrailing
            )
          )

          // Items
          ScrollView {
            VStack(spacing: 12) {
              ForEach(cartManager.items) { item in
                CartItemRow(item: item)
              }
            }
            .padding(16)
          }

          // Summary
          VStack(spacing: 12) {
            Divider()
              .foregroundColor(.blakkhailGold.opacity(0.3))

            HStack {
              Text("Subtotal")
                .font(.system(size: 13, weight: .light))
              Spacer()
              Text("$\(String(format: "%.2f", cartManager.subtotal))")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.blakkhailGold)
            }

            HStack {
              Text("Tax")
                .font(.system(size: 13, weight: .light))
              Spacer()
              Text("$\(String(format: "%.2f", cartManager.tax))")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(.blakkhailGold)
            }

            Divider()
              .foregroundColor(.blakkhailGold.opacity(0.3))

            HStack {
              Text("TOTAL")
                .font(.system(size: 14, weight: .black, design: .default))
                .tracking(1)
              Spacer()
              Text("$\(String(format: "%.2f", cartManager.total))")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.blakkhailNeon)
            }

            Button(action: { showCheckout = true }) {
              HStack {
                Text("PROCEED TO CHECKOUT")
                  .font(.system(size: 13, weight: .black, design: .default))
                  .tracking(1)
                Image(systemName: "arrow.right")
              }
              .frame(maxWidth: .infinity)
              .padding(.vertical, 14)
              .background(Color.blakkhailNeon)
              .foregroundColor(.blakkhailNavy)
              .cornerRadius(8)
            }

            Button(action: { cartManager.clear() }) {
              Text("CLEAR CART")
                .font(.system(size: 12, weight: .bold, design: .default))
                .tracking(1)
                .foregroundColor(.blakkhailGold)
            }
          }
          .padding(16)
          .background(Color.blakkhailNavy.opacity(0.4))
        }
      }
    }
    .navigationTitle("")
    .navigationBarTitleDisplayMode(.inline)
    .sheet(isPresented: $showCheckout) {
      CheckoutView()
        .environmentObject(cartManager)
    }
  }
}

// MARK: - Cart Item Row
struct CartItemRow: View {
  let item: CartItem
  @EnvironmentObject var cartManager: CartManager

  var body: some View {
    VStack(spacing: 12) {
      HStack(spacing: 12) {
        Rectangle()
          .fill(Color.blakkhailGold.opacity(0.1))
          .frame(width: 60, height: 60)
          .cornerRadius(4)

        VStack(alignment: .leading, spacing: 4) {
          Text(item.product.name)
            .font(.system(size: 13, weight: .bold))
            .lineLimit(1)

          Text("Size: \(item.size)")
            .font(.system(size: 11, weight: .light))
            .foregroundColor(.gray)

          Text("$\(String(format: "%.2f", item.product.price))")
            .font(.system(size: 12, weight: .bold))
            .foregroundColor(.blakkhailGold)
        }

        Spacer()

        VStack(spacing: 4) {
          Button(action: { cartManager.updateQuantity(item.id, quantity: item.quantity + 1) }) {
            Image(systemName: "plus")
              .font(.system(size: 10, weight: .bold))
          }

          Text("\(item.quantity)")
            .font(.system(size: 12, weight: .bold))

          Button(action: { if item.quantity > 1 { cartManager.updateQuantity(item.id, quantity: item.quantity - 1) } }) {
            Image(systemName: "minus")
              .font(.system(size: 10, weight: .bold))
          }
        }
        .foregroundColor(.blakkhailGold)
      }

      HStack {
        Spacer()
        Button(action: { cartManager.removeFromCart(item.id) }) {
          Text("Remove")
            .font(.system(size: 11, weight: .bold))
            .foregroundColor(.red)
        }
      }
    }
    .padding(12)
    .background(
      RoundedRectangle(cornerRadius: 8)
        .fill(Color.blakkhailNavy.opacity(0.4))
        .stroke(Color.blakkhailGold.opacity(0.2), lineWidth: 1)
    )
  }
}

// MARK: - Checkout View
struct CheckoutView: View {
  @EnvironmentObject var cartManager: CartManager
  @Environment(\.dismiss) var dismiss

  @State private var email = ""
  @State private var fullName = ""
  @State private var address = ""
  @State private var city = ""
  @State private var zipCode = ""
  @State private var isProcessing = false
  @State private var showSuccess = false

  var body: some View {
    ZStack {
      Color.blakkhailNavy
        .ignoresSafeArea()

      VStack {
        HStack {
          Button(action: { dismiss() }) {
            Image(systemName: "xmark")
              .foregroundColor(.blakkhailGold)
          }

          Spacer()

          Text("CHECKOUT")
            .font(.system(size: 16, weight: .bold, design: .default))
            .tracking(1)
            .foregroundColor(.blakkhailGold)

          Spacer()

          Color.clear.frame(width: 40)
        }
        .padding(16)
        .background(
          LinearGradient(
            gradient: Gradient(colors: [
              Color.blakkhailGold.opacity(0.05),
              Color.clear
            ]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
          )
        )

        ScrollView {
          VStack(spacing: 20) {
            // Contact Info
            VStack(alignment: .leading, spacing: 12) {
              Text("CONTACT")
                .font(.system(size: 11, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)

              TextField("Email", text: $email)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color.blakkhailNavy.opacity(0.6))
                .foregroundColor(.white)
                .cornerRadius(4)

              TextField("Full Name", text: $fullName)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color.blakkhailNavy.opacity(0.6))
                .foregroundColor(.white)
                .cornerRadius(4)
            }

            // Shipping Info
            VStack(alignment: .leading, spacing: 12) {
              Text("SHIPPING")
                .font(.system(size: 11, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)

              TextField("Address", text: $address)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color.blakkhailNavy.opacity(0.6))
                .foregroundColor(.white)
                .cornerRadius(4)

              HStack(spacing: 12) {
                TextField("City", text: $city)
                  .textFieldStyle(.plain)
                  .padding(12)
                  .background(Color.blakkhailNavy.opacity(0.6))
                  .foregroundColor(.white)
                  .cornerRadius(4)

                TextField("ZIP", text: $zipCode)
                  .textFieldStyle(.plain)
                  .padding(12)
                  .background(Color.blakkhailNavy.opacity(0.6))
                  .foregroundColor(.white)
                  .cornerRadius(4)
              }
            }

            // Order Summary
            VStack(spacing: 12) {
              HStack {
                Text("Subtotal")
                Spacer()
                Text("$\(String(format: "%.2f", cartManager.subtotal))")
                  .foregroundColor(.blakkhailGold)
              }

              HStack {
                Text("Tax")
                Spacer()
                Text("$\(String(format: "%.2f", cartManager.tax))")
                  .foregroundColor(.blakkhailGold)
              }

              Divider()
                .foregroundColor(.blakkhailGold.opacity(0.3))

              HStack {
                Text("TOTAL")
                  .font(.system(size: 13, weight: .black))
                Spacer()
                Text("$\(String(format: "%.2f", cartManager.total))")
                  .font(.system(size: 16, weight: .bold))
                  .foregroundColor(.blakkhailNeon)
              }
            }
            .padding(12)
            .background(Color.blakkhailNavy.opacity(0.4))
            .cornerRadius(8)
          }
          .padding(16)
        }

        // Complete Order Button
        Button(action: {
          isProcessing = true
          DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isProcessing = false
            showSuccess = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
              cartManager.clear()
              dismiss()
            }
          }
        }) {
          if isProcessing {
            ProgressView()
              .tint(.blakkhailNavy)
          } else {
            Text("COMPLETE ORDER")
              .font(.system(size: 13, weight: .black, design: .default))
              .tracking(1)
          }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.blakkhailNeon)
        .foregroundColor(.blakkhailNavy)
        .cornerRadius(8)
        .padding(16)
        .disabled(isProcessing || email.isEmpty || fullName.isEmpty || address.isEmpty)
      }
    }
    .alert("Order Complete", isPresented: $showSuccess) {
      Button("Done", role: .cancel) { }
    } message: {
      Text("Thank you for your order! Check your email for shipping details.")
    }
  }
}

#Preview {
  CartView()
    .environmentObject(CartManager())
    .preferredColorScheme(.dark)
}
