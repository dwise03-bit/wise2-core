import SwiftUI

struct ProductCatalogView: View {
  @EnvironmentObject var productManager: ProductManager
  @State private var searchText = ""
  @State private var selectedCategory = "All"

  let categories = ["All", "Tees", "Hoodies", "Hats", "Accessories"]

  var filteredProducts: [Product] {
    var products = productManager.products

    if selectedCategory != "All" {
      products = products.filter { $0.category.lowercased() == selectedCategory.lowercased() }
    }

    if !searchText.isEmpty {
      products = products.filter { product in
        product.name.localizedCaseInsensitiveContains(searchText) ||
        product.description.localizedCaseInsensitiveContains(searchText)
      }
    }

    return products
  }

  var body: some View {
    NavigationStack {
      ZStack {
        Color.blakkhailNavy
          .ignoresSafeArea()

        VStack(spacing: 0) {
          // Header
          VStack(spacing: 16) {
            Text("SHOP BLAKK HAIL")
              .font(.system(size: 32, weight: .black, design: .default))
              .tracking(-0.5)
              .foregroundColor(.blakkhailGold)
              .shadow(color: .blakkhailGold.opacity(0.3), radius: 10, x: 0, y: 0)

            Text("Authentic pieces built on heritage, culture, and no apologies.")
              .font(.system(size: 13, weight: .light))
              .foregroundColor(.gray)
              .multilineTextAlignment(.center)
              .tracking(0.5)
          }
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

          // Search Bar
          HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
              .foregroundColor(.blakkhailGold)

            TextField("Search products...", text: $searchText)
              .textFieldStyle(.plain)
              .foregroundColor(.white)

            if !searchText.isEmpty {
              Button(action: { searchText = "" }) {
                Image(systemName: "xmark.circle.fill")
                  .foregroundColor(.blakkhailGold)
              }
            }
          }
          .padding(12)
          .background(
            RoundedRectangle(cornerRadius: 8)
              .fill(Color.blakkhailNavy.opacity(0.6))
              .stroke(Color.blakkhailGold.opacity(0.3), lineWidth: 1)
          )
          .padding(16)

          // Category Filter
          ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
              ForEach(categories, id: \.self) { category in
                Button(action: { selectedCategory = category }) {
                  Text(category)
                    .font(.system(size: 12, weight: .bold, design: .default))
                    .tracking(1)
                    .foregroundColor(selectedCategory == category ? .blakkhailNavy : .blakkhailGold)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                      selectedCategory == category ?
                      Color.blakkhailGold :
                      Color.clear
                    )
                    .cornerRadius(4)
                    .overlay(
                      RoundedRectangle(cornerRadius: 4)
                        .stroke(Color.blakkhailGold.opacity(0.5), lineWidth: 1)
                    )
                }
              }
            }
            .padding(.horizontal, 16)
          }

          // Product Grid
          ScrollView {
            LazyVGrid(columns: [
              GridItem(.flexible(), spacing: 12),
              GridItem(.flexible(), spacing: 12)
            ], spacing: 12) {
              ForEach(filteredProducts) { product in
                NavigationLink(destination: ProductDetailView(product: product)) {
                  ProductCardView(product: product)
                }
              }
            }
            .padding(16)
          }
        }
      }
      .navigationTitle("")
      .navigationBarTitleDisplayMode(.inline)
    }
  }
}

// MARK: - Product Card
struct ProductCardView: View {
  let product: Product
  @State private var isHovered = false

  var body: some View {
    VStack(spacing: 0) {
      // Image
      Rectangle()
        .fill(
          LinearGradient(
            gradient: Gradient(colors: [
              Color.blakkhailGold.opacity(0.1),
              Color.blakkhailGold.opacity(0.05)
            ]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
          )
        )
        .frame(height: 200)
        .cornerRadius(8, corners: [.topLeft, .topRight])

      // Info
      VStack(alignment: .leading, spacing: 8) {
        Text(product.name)
          .font(.system(size: 13, weight: .bold))
          .foregroundColor(.white)
          .lineLimit(2)

        Text("$\(String(format: "%.2f", product.price))")
          .font(.system(size: 12, weight: .bold))
          .foregroundColor(.blakkhailGold)

        HStack {
          Text(product.inStock ? "In Stock" : "Out")
            .font(.system(size: 10, weight: .semibold))
            .foregroundColor(product.inStock ? .blakkhailNeon : .red)

          Spacer()

          Text(product.sizes.count > 0 ? "\(product.sizes.count) sizes" : "No sizes")
            .font(.system(size: 10, weight: .light))
            .foregroundColor(.gray)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(12)
      .background(Color.blakkhailNavy.opacity(0.4))
      .cornerRadius(8, corners: [.bottomLeft, .bottomRight])
    }
    .overlay(
      RoundedRectangle(cornerRadius: 8)
        .stroke(Color.blakkhailGold.opacity(0.2), lineWidth: 1)
    )
    .scaleEffect(isHovered ? 1.02 : 1.0)
    .onHover { hovering in
      withAnimation(.spring(response: 0.3, dampingFraction: 0.7, blendDuration: 0)) {
        isHovered = hovering
      }
    }
  }
}

#Preview {
  ProductCatalogView()
    .environmentObject(ProductManager())
    .preferredColorScheme(.dark)
}
