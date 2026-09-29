import SwiftUI

struct ProductDetailView: View {
  let product: Product
  @EnvironmentObject var cartManager: CartManager
  @Environment(\.dismiss) var dismiss

  @State private var selectedSize = ""
  @State private var quantity = 1
  @State private var showAddedAlert = false

  var body: some View {
    ZStack {
      Color.blakkhailNavy
        .ignoresSafeArea()

      ScrollView {
        VStack(spacing: 24) {
          // Image
          Rectangle()
            .fill(
              LinearGradient(
                gradient: Gradient(colors: [
                  Color.blakkhailGold.opacity(0.15),
                  Color.blakkhailGold.opacity(0.05)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              )
            )
            .frame(height: 300)
            .cornerRadius(12)

          VStack(alignment: .leading, spacing: 16) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
              Text("NEW DROP")
                .font(.system(size: 11, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)

              Text(product.name)
                .font(.system(size: 28, weight: .black, design: .default))
                .tracking(-0.5)
                .foregroundColor(.white)

              Text(product.description)
                .font(.system(size: 14, weight: .light))
                .foregroundColor(.gray)
                .tracking(0.5)
            }

            // Price
            VStack(alignment: .leading, spacing: 4) {
              Text("PRICE")
                .font(.system(size: 11, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)

              Text("$\(String(format: "%.2f", product.price))")
                .font(.system(size: 32, weight: .bold, design: .default))
                .foregroundColor(.blakkhailNeon)
            }

            // Size Selection
            VStack(alignment: .leading, spacing: 12) {
              Text("SIZE")
                .font(.system(size: 11, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)

              if product.sizes.isEmpty {
                Text("One size fits all")
                  .font(.system(size: 13, weight: .light))
                  .foregroundColor(.gray)
              } else {
                FlowLayout(spacing: 8) {
                  ForEach(product.sizes, id: \.self) { size in
                    Button(action: { selectedSize = size }) {
                      Text(size)
                        .font(.system(size: 12, weight: .bold, design: .default))
                        .frame(width: 50, height: 40)
                        .background(selectedSize == size ? Color.blakkhailGold : Color.clear)
                        .foregroundColor(selectedSize == size ? .blakkhailNavy : .blakkhailGold)
                        .cornerRadius(4)
                        .overlay(
                          RoundedRectangle(cornerRadius: 4)
                            .stroke(Color.blakkhailGold.opacity(0.5), lineWidth: 1)
                        )
                    }
                  }
                }
              }
            }

            // Quantity
            VStack(alignment: .leading, spacing: 12) {
              Text("QUANTITY")
                .font(.system(size: 11, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)

              HStack(spacing: 12) {
                Button(action: { if quantity > 1 { quantity -= 1 } }) {
                  Image(systemName: "minus")
                    .frame(width: 40, height: 40)
                    .background(Color.blakkhailNavy.opacity(0.6))
                    .foregroundColor(.blakkhailGold)
                    .cornerRadius(4)
                }

                Text("\(quantity)")
                  .font(.system(size: 16, weight: .bold))
                  .frame(maxWidth: .infinity)

                Button(action: { quantity += 1 }) {
                  Image(systemName: "plus")
                    .frame(width: 40, height: 40)
                    .background(Color.blakkhailNavy.opacity(0.6))
                    .foregroundColor(.blakkhailGold)
                    .cornerRadius(4)
                }
              }
            }

            // Add to Cart Button
            Button(action: {
              let selectedSize = product.sizes.isEmpty ? "One Size" : (selectedSize.isEmpty ? product.sizes.first ?? "One Size" : selectedSize)
              cartManager.addToCart(product, quantity: quantity, size: selectedSize)
              showAddedAlert = true
            }) {
              HStack {
                Text("ADD TO CART")
                  .font(.system(size: 14, weight: .black, design: .default))
                  .tracking(1)
                Image(systemName: "bag.badge.plus")
              }
              .frame(maxWidth: .infinity)
              .padding(.vertical, 16)
              .background(Color.blakkhailNeon)
              .foregroundColor(.blakkhailNavy)
              .cornerRadius(8)
            }
            .disabled(!product.inStock)
            .opacity(product.inStock ? 1 : 0.5)

            // Stock Status
            if !product.inStock {
              Text("Out of Stock")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.red)
                .frame(maxWidth: .infinity)
            }
          }
          .padding(20)
          .background(
            RoundedRectangle(cornerRadius: 12)
              .fill(Color.blakkhailNavy.opacity(0.4))
              .stroke(Color.blakkhailGold.opacity(0.2), lineWidth: 1)
          )
        }
        .padding(16)
      }
    }
    .navigationBarBackButtonHidden(false)
    .alert("Added to Cart", isPresented: $showAddedAlert) {
      Button("Continue Shopping", role: .cancel) { }
      NavigationLink("View Cart", destination: CartView())
    }
  }
}

// MARK: - Flow Layout
struct FlowLayout<Content: View>: View {
  let spacing: CGFloat
  let content: () -> Content

  init(spacing: CGFloat = 8, @ViewBuilder content: @escaping () -> Content) {
    self.spacing = spacing
    self.content = content
  }

  var body: some View {
    var width = CGFloat.zero
    var height = CGFloat.zero

    return ZStack(alignment: .topLeading) {
      ForEach(Array(0..<10), id: \.self) { index in
        content()
          .alignmentGuide(.leading) { d in
            if abs(width - d.width) > 300 {
              width = 0
              height -= d.height + spacing
            }
            let result = width
            width -= d.width + spacing
            return result
          }
          .alignmentGuide(.top) { _ in
            let result = height
            return result
          }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

#Preview {
  ProductDetailView(
    product: Product(
      id: "1",
      name: "Sample Tee",
      description: "Premium streetwear tee",
      price: 85.00,
      image: "tee",
      category: "Tees",
      inStock: true,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"]
    )
  )
  .environmentObject(CartManager())
  .preferredColorScheme(.dark)
}
