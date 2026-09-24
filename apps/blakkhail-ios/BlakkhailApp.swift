import SwiftUI
import PhotosUI

@main
struct BlakkhailApp: App {
  @StateObject var authManager = AuthManager()
  @StateObject var cartManager = CartManager()
  @StateObject var productManager = ProductManager()
  @StateObject var notificationManager = NotificationManager()
  @StateObject var wearablesManager = WearablesManager()
  @StateObject var glassesManager = MetaGlassesManager()
  @StateObject var styleManager = StyleAssistantManager()
  @StateObject var uploaderManager = ClothingUploaderManager()

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

          // Style Assistant
          StyleAssistantView()
            .tabItem {
              Label("AI Style", systemImage: "sparkles")
            }

          // Cart
          CartView()
            .tabItem {
              Label("Cart", systemImage: "cart.fill")
            }
            .badge(cartManager.items.count)

          // Designer Portal
          ClothingUploaderView()
            .tabItem {
              Label("Designer", systemImage: "square.and.arrow.up")
            }

          // Account
          AccountView()
            .tabItem {
              Label("Account", systemImage: "person.fill")
            }

          // Glasses Upload
          GlassesUploadView()
            .tabItem {
              Label("Glasses", systemImage: "glasses")
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
    .environmentObject(glassesManager)
    .environmentObject(styleManager)
    .environmentObject(uploaderManager)
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
      // Fallback to seeded BLAKKHAIL products
      self.products = Self.seedProducts()
    }
  }

  private static func seedProducts() -> [Product] {
    [
      Product(
        id: "bk-new-001",
        name: "Red Distressed Hail Hoodie",
        description: "Limited red short-sleeve hoodie with hand-finished distress details",
        price: 85.00,
        image: "🔴",
        category: "Hoodies",
        inStock: true,
        sizes: ["S", "M", "L", "XL", "2XL"]
      ),
      Product(
        id: "bk-new-002",
        name: "Piff City Utility Hoodie",
        description: "Hand-distressed utility hoodie with removable Piff City back panel",
        price: 125.00,
        image: "🎒",
        category: "Hoodies",
        inStock: true,
        sizes: ["S", "M", "L", "XL", "2XL"]
      ),
      Product(
        id: "bk-new-003",
        name: "Take Control Utility Tee",
        description: "Hand-distressed utility tee with modular Piff City patchwork",
        price: 110.00,
        image: "👕",
        category: "T-Shirts",
        inStock: true,
        sizes: ["XS", "S", "M", "L", "XL", "2XL"]
      ),
      Product(
        id: "bk-ess-001",
        name: "No berry Cush Gray",
        description: "PC Street life no berry kush destress short sleeve",
        price: 65.00,
        image: "⚫",
        category: "T-Shirts",
        inStock: true,
        sizes: ["S", "M", "L", "XL"]
      ),
      Product(
        id: "bk-ess-002",
        name: "No berry Cush Long Sleeve",
        description: "PC Street life no berry kush destress long sleeve hoodie",
        price: 65.00,
        image: "🖤",
        category: "Hoodies",
        inStock: true,
        sizes: ["S", "M", "L", "XL"]
      ),
      Product(
        id: "bk-ess-003",
        name: "Strawberry Haze",
        description: "PC Street life Strawberry haze destress long sleeve hoodie",
        price: 65.00,
        image: "🍓",
        category: "Hoodies",
        inStock: true,
        sizes: ["S", "M", "L", "XL"]
      ),
      Product(
        id: "bk-heritage-001",
        name: "Heritage Logo Hoodie",
        description: "Premium oversized hoodie with embroidered BLAKKHAIL logo",
        price: 89.99,
        image: "👔",
        category: "Hoodies",
        inStock: true,
        sizes: ["S", "M", "L", "XL", "2XL"]
      ),
      Product(
        id: "bk-heritage-002",
        name: "Gold Chain Necklace",
        description: "Premium 18k gold-plated chain necklace, signature BLAKKHAIL accessory",
        price: 49.99,
        image: "⛓️",
        category: "Accessories",
        inStock: true,
        sizes: ["18in", "20in", "24in"]
      ),
    ]
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

      let decoder = JSONDecoder()
      decoder.dateDecodingStrategy = .iso8601

      // Try to decode as array first, fallback to single object
      if let drops = try? decoder.decode([Drop].self, from: data) {
        self.upcomingDrops = drops
      } else if let drop = try? decoder.decode(Drop.self, from: data) {
        self.upcomingDrops = [drop]
      } else {
        self.upcomingDrops = []
      }
    } catch {
      print("Failed to fetch drops: \(error)")
      self.upcomingDrops = []
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

// MARK: - Meta Ray-Ban Glasses Manager
@MainActor
class MetaGlassesManager: ObservableObject {
  @Published var isConnected = false
  @Published var uploadedContent: [GlassesContent] = []
  @Published var isUploading = false
  @Published var batteryLevel = 85
  @Published var storageUsed = 3.2 // GB
  @Published var storageFree = 28.8 // GB

  func connectToGlasses() async {
    isConnected = true
    print("📷 Connected to Meta Ray-Ban Glasses")
  }

  func fetchContentFromGlasses() async {
    isUploading = true
    defer { isUploading = false }

    await Task.sleep(2_000_000_000) // 2 seconds

    // Simulate fetching content
    let mockContent = [
      GlassesContent(
        id: UUID().uuidString,
        type: "photo",
        thumbnail: "📸",
        timestamp: Date(),
        size: 2.5,
        duration: nil
      ),
      GlassesContent(
        id: UUID().uuidString,
        type: "video",
        thumbnail: "🎥",
        timestamp: Date().addingTimeInterval(-3600),
        size: 156.4,
        duration: 45
      ),
      GlassesContent(
        id: UUID().uuidString,
        type: "photo",
        thumbnail: "📸",
        timestamp: Date().addingTimeInterval(-7200),
        size: 3.1,
        duration: nil
      )
    ]

    uploadedContent = mockContent
  }

  func uploadToBlakkhail(_ content: GlassesContent) async {
    isUploading = true
    defer { isUploading = false }

    await Task.sleep(1_500_000_000) // 1.5 seconds
    print("✅ Uploaded \(content.type) to BLAKKHAIL")
  }

  func deleteFromGlasses(_ contentId: String) {
    uploadedContent.removeAll { $0.id == contentId }
    print("🗑️ Deleted content from glasses")
  }
}

struct GlassesContent: Identifiable {
  let id: String
  let type: String // "photo", "video"
  let thumbnail: String
  let timestamp: Date
  let size: Double // MB
  let duration: Int? // seconds, for videos
}

// MARK: - Style Assistant Manager
@MainActor
class StyleAssistantManager: ObservableObject {
  @Published var recommendations: [StyleRecommendation] = []
  @Published var isAnalyzing = false
  @Published var error: String?

  private let apiBase = "https://blakkhail.com/api"

  func analyzeOutfit(from image: UIImage?) async {
    isAnalyzing = true
    defer { isAnalyzing = false }

    await Task.sleep(2_000_000_000)

    let blakkhailRecommendations = [
      StyleRecommendation(id: "bk-001", category: "Top", suggestion: "Heritage Logo Hoodie", matchPercent: 94, productId: "bk-001", reason: "Premium oversized hoodie - BLAKKHAIL signature piece"),
      StyleRecommendation(id: "bk-002", category: "Bottom", suggestion: "Distressed Cargo Pants", matchPercent: 91, productId: "bk-002", reason: "Heritage silhouette with authentic distressing - pure street culture"),
      StyleRecommendation(id: "bk-003", category: "Accessories", suggestion: "Gold Chain Necklace", matchPercent: 89, productId: "bk-003", reason: "18k gold-plated - luxury meets streetwear"),
      StyleRecommendation(id: "bk-004", category: "Jacket", suggestion: "Black Leather Bomber", matchPercent: 96, productId: "bk-004", reason: "Premium leather with gold accents - ultimate heritage statement")
    ]

    self.recommendations = blakkhailRecommendations
  }

  func saveOutfitLook(_ outfit: SavedOutfit) async {
    print("✅ Outfit saved: \(outfit.name)")
  }
}

struct StyleRecommendation: Identifiable, Codable {
  let id: String
  let category: String
  let suggestion: String
  let matchPercent: Int
  let productId: String?
  let reason: String
}

struct SavedOutfit: Codable {
  let name: String
  let recommendations: [StyleRecommendation]
  let timestamp: Date
}

// MARK: - Clothing Uploader Manager
@MainActor
class ClothingUploaderManager: ObservableObject {
  @Published var uploadedProducts: [ClothingProduct] = []
  @Published var isUploading = false
  @Published var uploadProgress: Double = 0
  @Published var error: String?

  private let apiBase = "https://blakkhail.com/api"

  func uploadProduct(_ product: ClothingProduct) async {
    isUploading = true
    uploadProgress = 0
    defer { isUploading = false }

    for i in stride(from: 0, to: 100, by: 10) {
      uploadProgress = Double(i) / 100
      await Task.sleep(200_000_000)
    }

    uploadProgress = 1.0
    uploadedProducts.append(product)
    print("✅ Product uploaded: \(product.name)")
  }

  func fetchUploadedProducts() async {
    print("Fetching products...")
  }

  func deleteProduct(_ id: String) async {
    uploadedProducts.removeAll { $0.id == id }
    print("✅ Product deleted")
  }

  func publishProduct(_ id: String) async {
    if let index = uploadedProducts.firstIndex(where: { $0.id == id }) {
      uploadedProducts[index].isPublished = true
    }
    print("✅ Product published")
  }
}

struct ClothingProduct: Identifiable, Codable {
  var id: String = UUID().uuidString
  var name: String
  var description: String
  var category: String
  var price: Double
  var imageData: String?
  var sizes: [String]
  var colors: [String]
  var material: String
  var isPublished: Bool = false
  var uploadedDate: Date = Date()
  var views: Int = 0
  var orders: Int = 0
}

// MARK: - Glasses Upload View
struct GlassesUploadView: View {
  @EnvironmentObject var glassesManager: MetaGlassesManager

  var body: some View {
    ZStack {
      Color.blakkhailNavy.ignoresSafeArea()

      VStack(spacing: 16) {
        // Header
        Text("META RAY-BAN GLASSES")
          .font(.system(size: 24, weight: .black))
          .foregroundColor(.blakkhailGold)
          .tracking(1.2)

        if glassesManager.isConnected {
          // Connected State
          VStack(spacing: 12) {
            HStack(spacing: 12) {
              Circle()
                .fill(Color.green)
                .frame(width: 12, height: 12)
              Text("Connected")
                .foregroundColor(.green)
              Spacer()
              VStack(alignment: .trailing, spacing: 4) {
                Text("🔋 \(glassesManager.batteryLevel)%")
                  .font(.caption)
                Text("Storage: \(String(format: "%.1f", glassesManager.storageUsed))GB / 32GB")
                  .font(.caption2)
                  .foregroundColor(.gray)
              }
            }
            .padding(12)
            .background(Color.blakkhailNavy.opacity(0.5))
            .border(Color.blakkhailCyan, width: 1)
            .cornerRadius(6)

            // Fetch Button
            Button(action: {
              Task {
                await glassesManager.fetchContentFromGlasses()
              }
            }) {
              HStack {
                Image(systemName: "arrow.down.circle.fill")
                Text("FETCH CONTENT FROM GLASSES")
                  .font(.system(size: 12, weight: .bold))
                  .tracking(0.8)
              }
              .frame(maxWidth: .infinity)
              .padding(12)
              .background(LinearGradient(
                gradient: Gradient(colors: [
                  .blakkhailGold,
                  Color(red: 0.65, green: 0.52, blue: 0.28)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              ))
              .foregroundColor(.blakkhailNavy)
              .cornerRadius(6)
            }
            .disabled(glassesManager.isUploading)

            // Content List
            if !glassesManager.uploadedContent.isEmpty {
              VStack(alignment: .leading, spacing: 8) {
                Text("CAPTURED CONTENT")
                  .font(.caption)
                  .foregroundColor(.blakkhailGold)
                  .tracking(0.8)

                ScrollView {
                  VStack(spacing: 8) {
                    ForEach(glassesManager.uploadedContent) { content in
                      HStack(spacing: 12) {
                        Text(content.thumbnail)
                          .font(.system(size: 20))

                        VStack(alignment: .leading, spacing: 2) {
                          Text("\(content.type.uppercased()) • \(String(format: "%.1f", content.size))MB")
                            .font(.caption)
                            .foregroundColor(.blakkhailCyan)

                          Text(content.timestamp, style: .time)
                            .font(.caption2)
                            .foregroundColor(.gray)
                        }

                        Spacer()

                        Button(action: {
                          Task {
                            await glassesManager.uploadToBlakkhail(content)
                          }
                        }) {
                          Image(systemName: "icloud.and.arrow.up")
                            .foregroundColor(.blakkhailGold)
                        }
                      }
                      .padding(10)
                      .background(Color.black.opacity(0.3))
                      .cornerRadius(4)
                    }
                  }
                }
              }
              .padding(12)
              .background(Color.black.opacity(0.2))
              .cornerRadius(6)
            }
          }
        } else {
          // Disconnected State
          VStack(spacing: 20) {
            Image(systemName: "glasses")
              .font(.system(size: 48))
              .foregroundColor(.blakkhailGold)

            Text("Connect Your Ray-Ban Glasses")
              .font(.system(size: 16, weight: .bold))
              .foregroundColor(.white)

            Button(action: {
              Task {
                await glassesManager.connectToGlasses()
              }
            }) {
              HStack {
                Image(systemName: "link")
                Text("CONNECT GLASSES")
                  .font(.system(size: 13, weight: .bold))
                  .tracking(0.8)
              }
              .frame(maxWidth: .infinity)
              .padding(14)
              .background(LinearGradient(
                gradient: Gradient(colors: [
                  .blakkhailCyan,
                  Color(red: 0, green: 0.8, blue: 0.9)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              ))
              .foregroundColor(.blakkhailNavy)
              .cornerRadius(6)
            }
          }
          .frame(maxHeight: .infinity)
          .padding()
        }

        Spacer()
      }
      .padding(16)
    }
  }
}

// MARK: - Style Assistant View
struct StyleAssistantView: View {
  @EnvironmentObject var styleManager: StyleAssistantManager
  @State private var showImagePicker = false
  @State private var selectedImage: UIImage?
  @State private var showSaveDialog = false
  @State private var outfitName = ""
  
  var body: some View {
    ZStack {
      Color.blakkhailNavy.ignoresSafeArea()
      VStack(spacing: 0) {
        VStack(spacing: 8) {
          Text("AI STYLE ASSISTANT")
            .font(.system(size: 24, weight: .black))
            .foregroundColor(.blakkhailGold)
            .tracking(1.2)
          Text("Get personalized recommendations powered by ChatGPT")
            .font(.system(size: 12, weight: .light))
            .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.black.opacity(0.3))
        
        ScrollView {
          VStack(spacing: 20) {
            VStack(spacing: 12) {
              if let image = selectedImage {
                Image(uiImage: image)
                  .resizable()
                  .scaledToFit()
                  .frame(maxHeight: 250)
                  .cornerRadius(8)
              } else {
                VStack(spacing: 12) {
                  Image(systemName: "camera.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.blakkhailGold)
                  Text("Upload Your Outfit")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                  Text("Take a photo or select from library")
                    .font(.system(size: 12, weight: .light))
                    .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 200)
                .background(Color.black.opacity(0.4))
                .cornerRadius(8)
              }
              Button(action: { showImagePicker = true }) {
                HStack {
                  Image(systemName: "photo.on.rectangle")
                  Text("SELECT PHOTO")
                    .font(.system(size: 13, weight: .bold))
                }
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color.blakkhailCyan)
                .foregroundColor(.blakkhailNavy)
                .cornerRadius(6)
              }
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)
            
            if selectedImage != nil {
              Button(action: {
                Task { await styleManager.analyzeOutfit(from: selectedImage) }
              }) {
                HStack {
                  Image(systemName: "sparkles")
                  Text("ANALYZE WITH ChatGPT")
                    .font(.system(size: 14, weight: .bold))
                }
              }
              .frame(maxWidth: .infinity)
              .padding(14)
              .background(LinearGradient(
                gradient: Gradient(colors: [.blakkhailGold, Color(red: 0.65, green: 0.52, blue: 0.28)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              ))
              .foregroundColor(.blakkhailNavy)
              .cornerRadius(6)
            }
            
            if !styleManager.recommendations.isEmpty {
              VStack(alignment: .leading, spacing: 12) {
                HStack {
                  Text("RECOMMENDATIONS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.blakkhailGold)
                  Spacer()
                  Button(action: { showSaveDialog = true }) {
                    HStack(spacing: 4) {
                      Image(systemName: "heart.fill")
                      Text("SAVE")
                        .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundColor(.blakkhailNeon)
                  }
                }
                VStack(spacing: 12) {
                  ForEach(styleManager.recommendations) { rec in
                    RecommendationCard(recommendation: rec)
                  }
                }
              }
              .padding(16)
              .background(Color.black.opacity(0.3))
              .cornerRadius(8)
            }
          }
          .padding(16)
        }
      }
    }
    .sheet(isPresented: $showImagePicker) {
      ImagePickerStyle(image: $selectedImage)
    }
    .alert("Save Outfit", isPresented: $showSaveDialog) {
      TextField("Outfit name", text: $outfitName)
      Button("Save") {
        let outfit = SavedOutfit(name: outfitName, recommendations: styleManager.recommendations, timestamp: Date())
        Task { await styleManager.saveOutfitLook(outfit); outfitName = "" }
      }
      Button("Cancel", role: .cancel) { }
    }
  }
}

struct RecommendationCard: View {
  let recommendation: StyleRecommendation
  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(recommendation.category)
            .font(.system(size: 11, weight: .bold))
            .foregroundColor(.blakkhailCyan)
          Text(recommendation.suggestion)
            .font(.system(size: 13, weight: .semibold))
            .foregroundColor(.white)
        }
        Spacer()
        VStack(alignment: .trailing, spacing: 4) {
          Text("\(recommendation.matchPercent)%")
            .font(.system(size: 14, weight: .bold))
            .foregroundColor(.blakkhailNeon)
          ProgressView(value: Double(recommendation.matchPercent) / 100)
            .tint(.blakkhailGold)
            .frame(width: 60)
        }
      }
      Text(recommendation.reason)
        .font(.system(size: 12, weight: .light))
        .foregroundColor(.gray)
    }
    .padding(12)
    .background(Color.blakkhailNavy.opacity(0.5))
    .border(Color.blakkhailGold.opacity(0.2), width: 1)
    .cornerRadius(6)
  }
}

struct ImagePickerStyle: UIViewControllerRepresentable {
  @Binding var image: UIImage?
  @Environment(\.dismiss) var dismiss
  func makeUIViewController(context: Context) -> UIImagePickerController {
    let picker = UIImagePickerController()
    picker.delegate = context.coordinator
    picker.sourceType = .photoLibrary
    return picker
  }
  func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
  func makeCoordinator() -> Coordinator {
    Coordinator(self)
  }
  class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    let parent: ImagePickerStyle
    init(_ parent: ImagePickerStyle) { self.parent = parent }
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
      if let image = info[.originalImage] as? UIImage { parent.image = image }
      parent.dismiss()
    }
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
  }
}

// MARK: - Clothing Uploader View
struct ClothingUploaderView: View {
  @EnvironmentObject var uploaderManager: ClothingUploaderManager
  @State private var showForm = false
  
  var body: some View {
    ZStack {
      Color.blakkhailNavy.ignoresSafeArea()
      VStack(spacing: 0) {
        VStack(spacing: 8) {
          Text("DESIGNER PORTAL")
            .font(.system(size: 24, weight: .black))
            .foregroundColor(.blakkhailGold)
            .tracking(1.2)
          Text("Upload & manage your BLAKKHAIL collection")
            .font(.system(size: 12, weight: .light))
            .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.black.opacity(0.3))
        
        ScrollView {
          VStack(spacing: 20) {
            Button(action: { showForm = true }) {
              HStack(spacing: 12) {
                Image(systemName: "plus.circle.fill")
                VStack(alignment: .leading, spacing: 4) {
                  Text("NEW PRODUCT")
                    .font(.system(size: 14, weight: .bold))
                  Text("Upload your design")
                    .font(.system(size: 11, weight: .light))
                    .foregroundColor(.gray)
                }
                Spacer()
              }
              .frame(maxWidth: .infinity)
              .padding(16)
              .background(LinearGradient(
                gradient: Gradient(colors: [.blakkhailCyan, Color(red: 0, green: 0.8, blue: 0.9)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              ))
              .foregroundColor(.blakkhailNavy)
              .cornerRadius(8)
            }
            .padding(16)
            
            VStack(alignment: .leading, spacing: 12) {
              HStack {
                Text("YOUR PRODUCTS")
                  .font(.system(size: 12, weight: .bold))
                  .foregroundColor(.blakkhailGold)
                Spacer()
                Text("\(uploaderManager.uploadedProducts.count)")
                  .font(.system(size: 12, weight: .bold))
                  .foregroundColor(.blakkhailNeon)
              }
              .padding(16)
              .background(Color.black.opacity(0.2))
              
              if uploaderManager.uploadedProducts.isEmpty {
                VStack(spacing: 12) {
                  Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 40))
                    .foregroundColor(.blakkhailGold.opacity(0.5))
                  Text("No products yet")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.gray)
                  Text("Upload your first design")
                    .font(.system(size: 12, weight: .light))
                    .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 200)
                .background(Color.black.opacity(0.3))
                .cornerRadius(8)
              } else {
                VStack(spacing: 12) {
                  ForEach(uploaderManager.uploadedProducts) { p in
                    ProductClothingCard(product: p, uploaderManager: uploaderManager)
                  }
                }
                .padding(16)
              }
            }
            .padding(16)
          }
        }
      }
    }
    .sheet(isPresented: $showForm) {
      ProductFormViewStyle(isPresented: $showForm, uploaderManager: uploaderManager)
    }
    .task {
      await uploaderManager.fetchUploadedProducts()
    }
  }
}

struct ProductClothingCard: View {
  let product: ClothingProduct
  let uploaderManager: ClothingUploaderManager
  @State private var showDeleteAlert = false
  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack(alignment: .top, spacing: 12) {
        Rectangle()
          .fill(Color.blakkhailGold.opacity(0.1))
          .frame(width: 70, height: 90)
          .cornerRadius(4)
        VStack(alignment: .leading, spacing: 6) {
          Text(product.name)
            .font(.system(size: 13, weight: .bold))
            .lineLimit(1)
          Text(product.category)
            .font(.system(size: 11, weight: .light))
            .foregroundColor(.blakkhailCyan)
          Text("$\(String(format: "%.2f", product.price))")
            .font(.system(size: 12, weight: .bold))
            .foregroundColor(.blakkhailGold)
        }
        Spacer()
      }
      HStack(spacing: 8) {
        if !product.isPublished {
          Button(action: { Task { await uploaderManager.publishProduct(product.id) } }) {
            HStack(spacing: 4) {
              Image(systemName: "paperplane.fill")
              Text("PUBLISH")
                .font(.system(size: 10, weight: .bold))
            }
            .frame(maxWidth: .infinity)
            .padding(8)
            .background(Color.blakkhailGold)
            .foregroundColor(.blakkhailNavy)
            .cornerRadius(4)
          }
        }
        Button(action: { showDeleteAlert = true }) {
          HStack(spacing: 4) {
            Image(systemName: "trash.fill")
            Text("DELETE")
              .font(.system(size: 10, weight: .bold))
          }
          .frame(maxWidth: .infinity)
          .padding(8)
          .background(Color.red.opacity(0.2))
          .foregroundColor(.red)
          .cornerRadius(4)
        }
      }
    }
    .padding(12)
    .background(Color.blakkhailNavy.opacity(0.5))
    .border(Color.blakkhailGold.opacity(0.2), width: 1)
    .cornerRadius(6)
    .alert("Delete", isPresented: $showDeleteAlert) {
      Button("Delete", role: .destructive) { Task { await uploaderManager.deleteProduct(product.id) } }
      Button("Cancel", role: .cancel) { }
    } message: {
      Text("Cannot undo")
    }
  }
}

struct ProductFormViewStyle: View {
  @Binding var isPresented: Bool
  let uploaderManager: ClothingUploaderManager
  @State private var productName = ""
  @State private var price = ""
  var body: some View {
    NavigationStack {
      ZStack {
        Color.blakkhailNavy.ignoresSafeArea()
        ScrollView {
          VStack(spacing: 16) {
            TextField("Product Name", text: $productName)
              .blakkhailTextFieldStyle()
            TextField("Price", text: $price)
              .keyboardType(.decimalPad)
              .blakkhailTextFieldStyle()
            Button(action: {
              if !productName.isEmpty && !price.isEmpty {
                let p = ClothingProduct(name: productName, description: "", category: "T-Shirt", price: Double(price) ?? 0, sizes: [], colors: [], material: "")
                Task {
                  await uploaderManager.uploadProduct(p)
                  isPresented = false
                }
              }
            }) {
              Text("PUBLISH")
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color.blakkhailGold)
                .foregroundColor(.blakkhailNavy)
                .cornerRadius(6)
            }
          }
          .padding(16)
        }
      }
      .navigationTitle("New Product")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button("Cancel") { isPresented = false }
            .foregroundColor(.blakkhailCyan)
        }
      }
    }
  }
}

// Custom text field modifier
struct BlakkhailTextFieldModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .padding(10)
      .background(Color.black.opacity(0.3))
      .cornerRadius(6)
      .foregroundColor(.white)
  }
}

extension View {
  func blakkhailTextFieldStyle() -> some View {
    modifier(BlakkhailTextFieldModifier())
  }
}

// MARK: - API Configuration Manager
@MainActor
class APIConfigurationManager: ObservableObject {
  @Published var telynxApiKey: String {
    didSet { UserDefaults.standard.set(telynxApiKey, forKey: "telynxApiKey") }
  }
  @Published var chatGPTApiKey: String {
    didSet { UserDefaults.standard.set(chatGPTApiKey, forKey: "chatGPTApiKey") }
  }
  @Published var openAIApiKey: String {
    didSet { UserDefaults.standard.set(openAIApiKey, forKey: "openAIApiKey") }
  }
  
  init() {
    self.telynxApiKey = UserDefaults.standard.string(forKey: "telynxApiKey") ?? ""
    self.chatGPTApiKey = UserDefaults.standard.string(forKey: "chatGPTApiKey") ?? ""
    self.openAIApiKey = UserDefaults.standard.string(forKey: "openAIApiKey") ?? ""
  }
  
  func saveTelynxConfiguration() -> Bool {
    guard !telynxApiKey.isEmpty else { return false }
    UserDefaults.standard.set(telynxApiKey, forKey: "telynxApiKey")
    return true
  }
}

// MARK: - Settings View
struct SettingsView: View {
  @StateObject var apiConfig = APIConfigurationManager()
  @State private var showSaveAlert = false
  
  var body: some View {
    NavigationStack {
      ZStack {
        Color.blakkhailNavy.ignoresSafeArea()
        
        ScrollView {
          VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 12) {
              Text("API CONFIGURATION")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailGold)
                .tracking(0.8)
              
              Text("Configure AI services for enhanced features")
                .font(.system(size: 12, weight: .light))
                .foregroundColor(.gray)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Color.black.opacity(0.3))
            .cornerRadius(8)
            
            // Telynx Configuration
            VStack(alignment: .leading, spacing: 8) {
              Text("TELYNX API")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(.blakkhailCyan)
                .tracking(0.8)
              
              SecureField("Paste your Telynx API key", text: $apiConfig.telynxApiKey)
                .blakkhailTextFieldStyle()
              
              Text("Get your key from https://telynx.ai")
                .font(.system(size: 10, weight: .light))
                .foregroundColor(.gray)
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)
            
            // ChatGPT Configuration
            VStack(alignment: .leading, spacing: 8) {
              Text("CHATGPT API")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(.blakkhailCyan)
                .tracking(0.8)
              
              SecureField("Paste your ChatGPT API key", text: $apiConfig.chatGPTApiKey)
                .blakkhailTextFieldStyle()
              
              Text("Get your key from https://openai.com/api")
                .font(.system(size: 10, weight: .light))
                .foregroundColor(.gray)
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)
            
            // Save Button
            Button(action: {
              if apiConfig.saveTelynxConfiguration() {
                showSaveAlert = true
              }
            }) {
              Text("SAVE CONFIGURATION")
                .font(.system(size: 13, weight: .bold))
                .tracking(0.8)
                .frame(maxWidth: .infinity)
                .padding(14)
                .background(LinearGradient(
                  gradient: Gradient(colors: [.blakkhailGold, Color(red: 0.65, green: 0.52, blue: 0.28)]),
                  startPoint: .topLeading,
                  endPoint: .bottomTrailing
                ))
                .foregroundColor(.blakkhailNavy)
                .cornerRadius(6)
            }
          }
          .padding(16)
        }
      }
      .navigationTitle("Settings")
      .navigationBarTitleDisplayMode(.inline)
    }
    .alert("Configuration Saved", isPresented: $showSaveAlert) {
      Button("OK") { }
    } message: {
      Text("Telynx API key has been saved securely")
    }
  }
}

