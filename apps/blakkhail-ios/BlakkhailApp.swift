import SwiftUI

@main
struct BlakkhailApp: App {
  @StateObject var authManager = AuthManager()
  @StateObject var cartManager = CartManager()
  @StateObject var productManager = ProductManager()
  @StateObject var notificationManager = NotificationManager()
  @StateObject var wearablesManager = WearablesManager()

  var body: some Scene {
    WindowGroup {
      if authManager.isAuthenticated {
        TabView {
          // Home
          HomeView()
            .tabItem {
              Label("Home", systemImage: "house.fill")
            }

          // Shop
          ProductCatalogView()
            .tabItem {
              Label("Shop", systemImage: "bag.fill")
            }

          // Story
          BrandStoryView()
            .tabItem {
              Label("Story", systemImage: "book.fill")
            }

          // Cart
          CartView()
            .tabItem {
              Label("Cart", systemImage: "cart.fill")
            }
            .badge(cartManager.items.count)

          // Account
          AccountView()
            .tabItem {
              Label("Account", systemImage: "person.fill")
            }
        }
        .tint(Color(red: 0, green: 217/255, blue: 1)) // Cyan accent
      } else {
        AuthenticationView()
      }
    }
    .environmentObject(authManager)
    .environmentObject(cartManager)
    .environmentObject(productManager)
    .environmentObject(notificationManager)
    .environmentObject(wearablesManager)
  }
}

// MARK: - Brand Colors
extension Color {
  static let blakkhailNavy = Color(red: 5/255, green: 6/255, blue: 7/255)
  static let blakkhailCyan = Color(red: 0, green: 217/255, blue: 1)
  static let blakkhailNeon = Color(red: 0, green: 1, blue: 127/255)
  static let blakkhailGold = Color(red: 196/255, green: 163/255, blue: 105/255)
}

// MARK: - Models
struct Product: Identifiable, Codable {
  let id: String
  let name: String
  let description: String
  let price: Double
  let image: String
  let category: String
  let inStock: Bool
  let sizes: [String]
}

struct User: Codable {
  let id: String
  let email: String
  let displayName: String
  let createdAt: Date
}

struct CartItem: Identifiable {
  let id = UUID()
  let product: Product
  var quantity: Int
  var size: String
}

// MARK: - Auth Manager
@MainActor
class AuthManager: ObservableObject {
  @Published var isAuthenticated = true  // DEBUG: Skip login for testing
  @Published var currentUser: User?
  @Published var isLoading = false
  @Published var error: String?

  private let apiBase = "https://blakkhail.com/api"

  func login(email: String, password: String) async {
    isLoading = true
    defer { isLoading = false }

    do {
      let credentials = ["email": email, "password": password]
      let data = try JSONEncoder().encode(credentials)

      var request = URLRequest(url: URL(string: "\(apiBase)/auth/login")!)
      request.httpMethod = "POST"
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = data

      let (responseData, _) = try await URLSession.shared.data(for: request)
      let response = try JSONDecoder().decode(AuthResponse.self, from: responseData)

      self.currentUser = response.user
      self.isAuthenticated = true
      UserDefaults.standard.set(response.token, forKey: "authToken")
    } catch {
      self.error = "Login failed: \(error.localizedDescription)"
    }
  }

  func signup(email: String, password: String, displayName: String) async {
    isLoading = true
    defer { isLoading = false }

    do {
      let userInfo = ["email": email, "password": password, "displayName": displayName]
      let data = try JSONEncoder().encode(userInfo)

      var request = URLRequest(url: URL(string: "\(apiBase)/auth/signup")!)
      request.httpMethod = "POST"
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = data

      let (responseData, _) = try await URLSession.shared.data(for: request)
      let response = try JSONDecoder().decode(AuthResponse.self, from: responseData)

      self.currentUser = response.user
      self.isAuthenticated = true
      UserDefaults.standard.set(response.token, forKey: "authToken")
    } catch {
      self.error = "Signup failed: \(error.localizedDescription)"
    }
  }

  func logout() {
    isAuthenticated = false
    currentUser = nil
    UserDefaults.standard.removeObject(forKey: "authToken")
  }
}

struct AuthResponse: Codable {
  let token: String
  let user: User
}

// MARK: - Cart Manager
@MainActor
class CartManager: ObservableObject {
  @Published var items: [CartItem] = []

  var subtotal: Double {
    items.reduce(0) { $0 + ($1.product.price * Double($1.quantity)) }
  }

  var tax: Double {
    subtotal * 0.08 // 8% tax
  }

  var total: Double {
    subtotal + tax
  }

  func addToCart(_ product: Product, quantity: Int = 1, size: String) {
    if let index = items.firstIndex(where: { $0.product.id == product.id && $0.size == size }) {
      items[index].quantity += quantity
    } else {
      items.append(CartItem(product: product, quantity: quantity, size: size))
    }
  }

  func removeFromCart(_ id: UUID) {
    items.removeAll { $0.id == id }
  }

  func updateQuantity(_ id: UUID, quantity: Int) {
    if let index = items.firstIndex(where: { $0.id == id }) {
      items[index].quantity = quantity
    }
  }

  func clear() {
    items.removeAll()
  }
}

// MARK: - Product Manager
@MainActor
class ProductManager: ObservableObject {
  @Published var products: [Product] = []
  @Published var isLoading = false
  @Published var error: String?

  private let apiBase = "https://blakkhail.com/api"

  func fetchProducts() async {
    isLoading = true
    defer { isLoading = false }

    do {
      let url = URL(string: "\(apiBase)/products")!
      let (data, _) = try await URLSession.shared.data(from: url)
      self.products = try JSONDecoder().decode([Product].self, from: data)
    } catch {
      self.error = "Failed to load products: \(error.localizedDescription)"
    }
  }

  func searchProducts(_ query: String) -> [Product] {
    products.filter { product in
      product.name.localizedCaseInsensitiveContains(query) ||
      product.description.localizedCaseInsensitiveContains(query)
    }
  }

  func filterByCategory(_ category: String) -> [Product] {
    products.filter { $0.category == category }
  }
}

// MARK: - Notification Manager
@MainActor
class NotificationManager: ObservableObject {
  @Published var upcomingDrops: [Drop] = []
  @Published var isSubscribed = false

  private let apiBase = "https://blakkhail.com/api"

  func subscribeToDrops() async {
    isSubscribed = true
    UserDefaults.standard.set(true, forKey: "dropNotificationsEnabled")
  }

  func fetchUpcomingDrops() async {
    do {
      let url = URL(string: "\(apiBase)/drops")!
      let (data, _) = try await URLSession.shared.data(from: url)
      self.upcomingDrops = try JSONDecoder().decode([Drop].self, from: data)
    } catch {
      print("Failed to fetch drops: \(error)")
    }
  }
}

struct Drop: Identifiable, Codable {
  let id: String
  let name: String
  let description: String
  let releaseDate: Date
  let image: String
  let productCount: Int
}

// MARK: - Wearables Manager
@MainActor
class WearablesManager: ObservableObject {
  @Published var connectedDevices: [WearableDevice] = []
  @Published var isScanning = false
  @Published var hasAppleWatch = false
  @Published var hasAirPods = false
  @Published var hasFitnessTracker = false

  func scanForWearables() async {
    isScanning = true
    defer { isScanning = false }

    // Simulate device discovery
    await Task.sleep(1_000_000_000) // 1 second

    // Add discovered devices
    if Bool.random() {
      connectedDevices.append(WearableDevice(name: "Apple Watch Ultra", type: "watch", isConnected: true))
      hasAppleWatch = true
    }

    if Bool.random() {
      connectedDevices.append(WearableDevice(name: "AirPods Pro", type: "earbuds", isConnected: true))
      hasAirPods = true
    }

    if Bool.random() {
      connectedDevices.append(WearableDevice(name: "Fitness Tracker", type: "tracker", isConnected: true))
      hasFitnessTracker = true
    }
  }

  func sendNotificationToWearable(_ device: WearableDevice, message: String) {
    print("📱 Sending to \(device.name): \(message)")
  }

  func syncCartToWatch() {
    if let watch = connectedDevices.first(where: { $0.type == "watch" }) {
      sendNotificationToWearable(watch, message: "Cart synced to Apple Watch")
    }
  }
}

struct WearableDevice: Identifiable {
  let id = UUID()
  let name: String
  let type: String // "watch", "earbuds", "tracker"
  let isConnected: Bool
}
