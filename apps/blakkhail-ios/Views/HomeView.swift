import SwiftUI

struct HomeView: View {
  @EnvironmentObject var productManager: ProductManager
  @EnvironmentObject var notificationManager: NotificationManager

  var body: some View {
    NavigationStack {
      ZStack {
        // Premium background
        Color.blakkhailNavy
          .ignoresSafeArea()

        ScrollView {
          VStack(spacing: 0) {
            // Hero Section
            VStack(spacing: 20) {
              VStack(spacing: 8) {
                Text("HERITAGE")
                  .font(.system(size: 36, weight: .black, design: .default))
                  .tracking(1.5)
                  .foregroundColor(.blakkhailGold)

                Text("TAKE CONTROL")
                  .font(.system(size: 48, weight: .black, design: .default))
                  .tracking(-0.5)
                  .foregroundColor(.blakkhailGold)
                  .shadow(color: .blakkhailGold.opacity(0.4), radius: 20, x: 0, y: 0)
              }

              Text("Original streetwear culture built on legacy, authenticity, and no apologies.")
                .font(.system(size: 16, weight: .light, design: .default))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .tracking(0.5)

              NavigationLink(destination: ProductCatalogView()) {
                HStack {
                  Text("SHOP COLLECTION")
                    .font(.system(size: 14, weight: .black, design: .default))
                    .tracking(1)
                  Image(systemName: "arrow.right")
                    .font(.system(size: 12, weight: .bold))
                }
                .foregroundColor(.blakkhailNavy)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.blakkhailNeon)
                .cornerRadius(4)
              }
            }
            .padding(24)
            .background(
              LinearGradient(
                gradient: Gradient(colors: [
                  Color.black.opacity(0.3),
                  Color.blakkhailGold.opacity(0.05)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              )
            )

            // Upcoming Drops
            VStack(alignment: .leading, spacing: 16) {
              Text("NEW DROPS")
                .font(.system(size: 12, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)
                .padding(.horizontal, 24)
                .padding(.top, 24)

              if notificationManager.upcomingDrops.isEmpty {
                VStack(spacing: 8) {
                  Text("No upcoming drops")
                    .font(.system(size: 14, weight: .semibold))
                  Text("Subscribe for notifications")
                    .font(.system(size: 12, weight: .light))
                    .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .padding(24)
              } else {
                ScrollView(.horizontal, showsIndicators: false) {
                  HStack(spacing: 12) {
                    ForEach(notificationManager.upcomingDrops) { drop in
                      DropCard(drop: drop)
                    }
                  }
                  .padding(.horizontal, 24)
                }
              }
            }
            .padding(.vertical, 24)

            // Featured Products
            VStack(alignment: .leading, spacing: 16) {
              Text("FEATURED")
                .font(.system(size: 12, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)
                .padding(.horizontal, 24)

              if productManager.products.isEmpty {
                ProgressView()
                  .tint(.blakkhailGold)
                  .frame(maxWidth: .infinity)
                  .padding(40)
              } else {
                VStack(spacing: 12) {
                  ForEach(productManager.products.prefix(3)) { product in
                    NavigationLink(destination: ProductDetailView(product: product)) {
                      ProductRowView(product: product)
                    }
                  }
                }
                .padding(.horizontal, 24)
              }
            }
            .padding(.vertical, 24)

            // Story Section
            VStack(spacing: 12) {
              Text("EST. 1994")
                .font(.system(size: 12, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)

              Text("LEGACY")
                .font(.system(size: 28, weight: .black, design: .default))
                .tracking(-0.3)
                .foregroundColor(.blakkhailGold)

              Text("Three decades of authentic streetwear culture")
                .font(.system(size: 14, weight: .light))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .tracking(0.5)
            }
            .frame(maxWidth: .infinity)
            .padding(24)
            .background(
              LinearGradient(
                gradient: Gradient(colors: [
                  Color.blakkhailGold.opacity(0.05),
                  Color.black.opacity(0.2)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              )
            )
            .padding(.vertical, 24)
          }
        }
      }
      .navigationTitle("")
      .navigationBarTitleDisplayMode(.inline)
      .task {
        await productManager.fetchProducts()
        await notificationManager.fetchUpcomingDrops()
      }
    }
  }
}

// MARK: - Drop Card
struct DropCard: View {
  let drop: Drop

  var body: some View {
    VStack(spacing: 8) {
      Text(drop.name)
        .font(.system(size: 12, weight: .bold, design: .default))
        .tracking(1)
        .foregroundColor(.blakkhailGold)

      Text(drop.releaseDate.formatted(date: .abbreviated, time: .omitted))
        .font(.system(size: 11, weight: .light))
        .foregroundColor(.gray)

      Text("\(drop.productCount) items")
        .font(.system(size: 10, weight: .semibold))
        .foregroundColor(.blakkhailNeon)
    }
    .frame(width: 120)
    .padding(12)
    .background(
      RoundedRectangle(cornerRadius: 8)
        .fill(Color.blakkhailNavy.opacity(0.6))
        .stroke(Color.blakkhailGold.opacity(0.3), lineWidth: 1)
    )
  }
}

// MARK: - Product Row View
struct ProductRowView: View {
  let product: Product

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(alignment: .top, spacing: 12) {
        Rectangle()
          .fill(Color.blakkhailGold.opacity(0.1))
          .frame(width: 80, height: 100)
          .cornerRadius(4)

        VStack(alignment: .leading, spacing: 6) {
          Text(product.name)
            .font(.system(size: 14, weight: .bold))
            .lineLimit(2)

          Text(product.description)
            .font(.system(size: 12, weight: .light))
            .foregroundColor(.gray)
            .lineLimit(2)

          HStack {
            Text("$\(String(format: "%.2f", product.price))")
              .font(.system(size: 13, weight: .bold))
              .foregroundColor(.blakkhailGold)

            Spacer()

            Text(product.inStock ? "In Stock" : "Out")
              .font(.system(size: 10, weight: .semibold))
              .foregroundColor(product.inStock ? .blakkhailNeon : .red)
          }
        }

        Spacer()
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

#Preview {
  HomeView()
    .environmentObject(ProductManager())
    .environmentObject(NotificationManager())
    .preferredColorScheme(.dark)
}
