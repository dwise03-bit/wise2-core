import UIKit
import SwiftUI
import MapKit
import CoreLocation
import Combine
import Network
import Security
import CoreBluetooth
import AVFoundation
import PhotosUI
import ARKit
import PencilKit

// MARK: - Scene Delegate

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = UIHostingController(rootView: RootView().environmentObject(AuthManager.shared))
        window?.makeKeyAndVisible()
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    }
}

// MARK: - Keychain (secure JWT storage — Phase 1)

enum KeychainHelper {
    private static let service = "com.wisedefense.fieldtech"

    static func save(_ value: String, forKey key: String) {
        let data = Data(value.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)

        var attributes = query
        attributes[kSecValueData as String] = data
        attributes[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(attributes as CFDictionary, nil)
    }

    static func read(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}

private enum KeychainKey {
    static let accessToken = "fieldtech.accessToken"
    static let refreshToken = "fieldtech.refreshToken"
    static let userEmail = "fieldtech.userEmail"
}

// MARK: - Networking primitives

enum APIError: Error, LocalizedError {
    case badURL
    case unauthorized
    case forbidden
    case server(Int)
    case decoding
    case offline

    var errorDescription: String? {
        switch self {
        case .badURL: return "Invalid request URL."
        case .unauthorized: return "Your session has expired. Please sign in again."
        case .forbidden: return "You do not have permission to perform this action."
        case .server(let code): return "Server error (\(code)). Please try again."
        case .decoding: return "Received an unexpected response from the server."
        case .offline: return "No network connection."
        }
    }
}

extension Notification.Name {
    static let fieldTechUnauthorized = Notification.Name("FieldTechUnauthorized")
}

// MARK: - Auth models (matches packages/api/src/auth AuthController)

struct LoginRequestBody: Encodable {
    let email: String
    let password: String
}

struct AuthUser: Codable {
    let id: String
    let email: String
    let role: String?
    let firstName: String?
    let lastName: String?
}

struct LoginResponse: Codable {
    let accessToken: String
    let refreshToken: String?
    let user: AuthUser
    let expiresIn: Int?
}

// MARK: - Hermes AI models (matches packages/api/src/hermes HermesController) — Phase 5

struct HermesChatRequestBody: Encodable {
    let message: String
    let mode: String
    let profile: String
}

struct HermesChatResponse: Decodable {
    let response: String
    let mode: String?
    let model: String?
    let profile: String?
    let provider: String?
    let durationMs: Int?
    let evidenceStatus: String?
}

struct PhotoUploadResponse: Decodable {
    let photoId: String
    let url: String?
    let jobId: String?
    let uploadedAt: String?
}

// MARK: - Job model (matches packages/db Prisma FieldTechJob model)

struct FieldTechJob: Identifiable, Codable, Equatable {
    let id: String
    let customerName: String
    let customerPhone: String?
    let address: String
    let appointmentAt: String?
    let complaint: String
    let equipmentId: String?
    let status: String
    let priority: String
    let notes: String?
    let createdAt: String?
    let updatedAt: String?
}

// MARK: - Shared coloring / labeling helpers
// Statuses: SCHEDULED, EN_ROUTE, ARRIVED, DIAGNOSING, REPAIRING, WAITING, COMPLETE
// Priorities: LOW, NORMAL, HIGH, EMERGENCY

func priorityColor(_ priority: String) -> Color {
    switch priority.uppercased() {
    case "EMERGENCY": return Color(red: 1, green: 0.2, blue: 0.2)
    case "HIGH": return Color(red: 1, green: 0.5, blue: 0)
    case "NORMAL": return Color(red: 0, green: 1, blue: 0.53)
    case "LOW": return Color(red: 0, green: 0.33, blue: 1)
    default: return Color(red: 0.4, green: 0.4, blue: 0.4)
    }
}

func statusIcon(_ status: String) -> String {
    switch status.uppercased() {
    case "SCHEDULED": return "clock.fill"
    case "EN_ROUTE": return "location.fill"
    case "ARRIVED": return "building.2.fill"
    case "DIAGNOSING": return "stethoscope"
    case "REPAIRING": return "wrench.and.screwdriver.fill"
    case "WAITING": return "hourglass"
    case "COMPLETE": return "checkmark.circle.fill"
    default: return "questionmark.circle"
    }
}

func statusColor(_ status: String) -> Color {
    switch status.uppercased() {
    case "SCHEDULED": return .gray
    case "EN_ROUTE": return .blue
    case "ARRIVED": return .purple
    case "DIAGNOSING", "REPAIRING": return .orange
    case "WAITING": return .yellow
    case "COMPLETE": return .green
    default: return .gray
    }
}

func statusLabel(_ status: String) -> String {
    status.replacingOccurrences(of: "_", with: " ").capitalized
}

// MARK: - API Client (Phase 2 — real wise2.net integration)

final class FieldTechAPIClient: @unchecked Sendable {
    static let shared = FieldTechAPIClient()

    private let baseURL = "https://api.wise2.net/api/v1/fieldtech"
    private let authURL = "https://api.wise2.net/api/v1/auth"
    private let hermesURL = "https://api.wise2.net/api/v1/hermes"

    private func authHeader() -> [String: String] {
        if let token = KeychainHelper.read(forKey: KeychainKey.accessToken) {
            return ["Authorization": "Bearer \(token)"]
        }
        return [:]
    }

    private func send(_ request: URLRequest) async throws -> Data {
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw APIError.offline
        }
        guard let http = response as? HTTPURLResponse else {
            throw APIError.server(0)
        }
        switch http.statusCode {
        case 200...299:
            return data
        case 401:
            NotificationCenter.default.post(name: .fieldTechUnauthorized, object: nil)
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        default:
            throw APIError.server(http.statusCode)
        }
    }

    // MARK: Auth

    func login(email: String, password: String) async throws -> LoginResponse {
        guard let url = URL(string: "\(authURL)/login") else { throw APIError.badURL }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(LoginRequestBody(email: email, password: password))

        let data = try await send(request)
        do {
            return try JSONDecoder().decode(LoginResponse.self, from: data)
        } catch {
            throw APIError.decoding
        }
    }

    // MARK: Jobs

    func fetchJobs() async throws -> [FieldTechJob] {
        guard let url = URL(string: "\(baseURL)/jobs") else { throw APIError.badURL }
        var request = URLRequest(url: url)
        request.allHTTPHeaderFields = authHeader()

        let data = try await send(request)
        do {
            return try JSONDecoder().decode([FieldTechJob].self, from: data)
        } catch {
            throw APIError.decoding
        }
    }

    func updateJob(_ jobId: String, status: String?, notes: String?) async throws {
        guard let url = URL(string: "\(baseURL)/jobs/\(jobId)") else { throw APIError.badURL }
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.allHTTPHeaderFields = authHeader()
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        var body: [String: String] = [:]
        if let status { body["status"] = status }
        if let notes { body["notes"] = notes }
        request.httpBody = try JSONEncoder().encode(body)

        _ = try await send(request)
    }

    // MARK: Media Upload

    func uploadJobPhoto(_ jobId: String, photo: UIImage) async throws -> String {
        guard let url = URL(string: "\(baseURL)/jobs/\(jobId)/photos") else { throw APIError.badURL }
        guard let photoData = photo.jpegData(compressionQuality: 0.8) else { throw APIError.decoding }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.allHTTPHeaderFields = authHeader()

        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"photo\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(photoData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body
        let data = try await send(request)
        do {
            let response = try JSONDecoder().decode(PhotoUploadResponse.self, from: data)
            return response.photoId
        } catch {
            throw APIError.decoding
        }
    }

    // MARK: Hermes AI

    func generateNotes(prompt: String) async throws -> HermesChatResponse {
        guard let url = URL(string: "\(hermesURL)/chat") else { throw APIError.badURL }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.allHTTPHeaderFields = authHeader()
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(
            HermesChatRequestBody(message: prompt, mode: "systems", profile: "fast")
        )

        let data = try await send(request)
        do {
            return try JSONDecoder().decode(HermesChatResponse.self, from: data)
        } catch {
            throw APIError.decoding
        }
    }
}

// MARK: - Auth Manager (Phase 1 — session persistence + auto logout on 401)

@MainActor
final class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var isAuthenticated: Bool
    @Published var currentUser: AuthUser?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private var cancellables = Set<AnyCancellable>()

    private init() {
        let token = KeychainHelper.read(forKey: KeychainKey.accessToken)
        self.isAuthenticated = token != nil
        if let email = KeychainHelper.read(forKey: KeychainKey.userEmail) {
            self.currentUser = AuthUser(id: "", email: email, role: nil, firstName: nil, lastName: nil)
        }

        NotificationCenter.default.publisher(for: .fieldTechUnauthorized)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in
                self?.logout()
                self?.errorMessage = "Your session expired. Please sign in again."
            }
            .store(in: &cancellables)
    }

    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let response = try await FieldTechAPIClient.shared.login(email: email, password: password)
            KeychainHelper.save(response.accessToken, forKey: KeychainKey.accessToken)
            if let refreshToken = response.refreshToken {
                KeychainHelper.save(refreshToken, forKey: KeychainKey.refreshToken)
            }
            KeychainHelper.save(response.user.email, forKey: KeychainKey.userEmail)
            currentUser = response.user
            isAuthenticated = true
        } catch let apiError as APIError {
            errorMessage = apiError.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    func logout() {
        KeychainHelper.delete(forKey: KeychainKey.accessToken)
        KeychainHelper.delete(forKey: KeychainKey.refreshToken)
        KeychainHelper.delete(forKey: KeychainKey.userEmail)
        currentUser = nil
        isAuthenticated = false
    }
}

// MARK: - Network Monitor (Phase 2)

@MainActor
final class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()

    @Published var isConnected = true

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "com.wisedefense.fieldtech.network")

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            let connected = path.status == .satisfied
            Task { @MainActor in
                self?.isConnected = connected
            }
        }
        monitor.start(queue: queue)
    }
}

// MARK: - Offline Queue (Phase 2 — persists failed job updates for retry)

struct PendingJobUpdate: Codable, Identifiable {
    let id: UUID
    let jobId: String
    let status: String?
    let notes: String?
    let createdAt: Date
}

@MainActor
final class OfflineQueueManager: ObservableObject {
    static let shared = OfflineQueueManager()

    @Published private(set) var pending: [PendingJobUpdate] = []

    private var fileURL: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        return docs.appendingPathComponent("fieldtech_offline_queue.json")
    }

    private init() {
        load()
    }

    func enqueue(jobId: String, status: String?, notes: String?) {
        pending.append(PendingJobUpdate(id: UUID(), jobId: jobId, status: status, notes: notes, createdAt: Date()))
        save()
    }

    func flush() async {
        guard NetworkMonitor.shared.isConnected, !pending.isEmpty else { return }
        var remaining: [PendingJobUpdate] = []
        for update in pending {
            do {
                try await FieldTechAPIClient.shared.updateJob(update.jobId, status: update.status, notes: update.notes)
            } catch {
                remaining.append(update)
            }
        }
        pending = remaining
        save()
    }

    private func save() {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        guard let data = try? encoder.encode(pending) else { return }
        try? data.write(to: fileURL, options: .atomic)
    }

    private func load() {
        guard let data = try? Data(contentsOf: fileURL) else { return }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        pending = (try? decoder.decode([PendingJobUpdate].self, from: data)) ?? []
    }
}

// MARK: - Local media storage (Phase 4 — photos + signatures captured on-device)

final class MediaStore {
    static let shared = MediaStore()
    private init() {}

    private func jobDirectory(for jobId: String) -> URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = docs.appendingPathComponent("FieldTechMedia/\(jobId)", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    @discardableResult
    func saveMedia(jobId: String, photos: [UIImage], signature: UIImage?) -> [URL] {
        let dir = jobDirectory(for: jobId)
        var saved: [URL] = []
        let timestamp = Int(Date().timeIntervalSince1970)

        for (index, photo) in photos.enumerated() {
            guard let data = photo.jpegData(compressionQuality: 0.8) else { continue }
            let url = dir.appendingPathComponent("photo_\(timestamp)_\(index).jpg")
            if (try? data.write(to: url)) != nil {
                saved.append(url)
            }
        }

        if let signature, let data = signature.pngData() {
            let url = dir.appendingPathComponent("signature_\(timestamp).png")
            if (try? data.write(to: url)) != nil {
                saved.append(url)
            }
        }

        return saved
    }

    func mediaFiles(for jobId: String) -> [URL] {
        let dir = jobDirectory(for: jobId)
        return (try? FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)) ?? []
    }
}

// MARK: - View Model

@MainActor
final class FieldTechViewModel: NSObject, ObservableObject, @unchecked Sendable {
    @Published var jobs: [FieldTechJob] = []
    @Published var jobCoordinates: [String: CLLocationCoordinate2D] = [:]
    @Published var userLocation: CLLocationCoordinate2D?
    @Published var isLoading = false
    @Published var error: String?
    @Published var usingLiveData = true

    private let locationManager = CLLocationManager()
    private let geocoder = CLGeocoder()
    private var syncTimer: Timer?
    private var cancellables = Set<AnyCancellable>()

    static let demoJobs: [FieldTechJob] = [
        FieldTechJob(id: "JOB-001", customerName: "John Smith", customerPhone: "212-555-0101", address: "350 5th Ave, New York, NY", appointmentAt: nil, complaint: "AC unit not cooling", equipmentId: nil, status: "SCHEDULED", priority: "HIGH", notes: nil, createdAt: nil, updatedAt: nil),
        FieldTechJob(id: "JOB-002", customerName: "Sarah Johnson", customerPhone: "212-555-0102", address: "30 Rockefeller Plaza, New York, NY", appointmentAt: nil, complaint: "Furnace annual service", equipmentId: nil, status: "EN_ROUTE", priority: "NORMAL", notes: nil, createdAt: nil, updatedAt: nil),
        FieldTechJob(id: "JOB-003", customerName: "Mike Davis", customerPhone: "212-555-0103", address: "11 Wall St, New York, NY", appointmentAt: nil, complaint: "Duct cleaning requested", equipmentId: nil, status: "SCHEDULED", priority: "LOW", notes: nil, createdAt: nil, updatedAt: nil)
    ]

    override init() {
        super.init()
        setupLocationManager()
        startAutoSync()
        observeConnectivity()
        Task {
            await OfflineQueueManager.shared.flush()
            await loadJobs()
        }
    }

    private func setupLocationManager() {
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.requestWhenInUseAuthorization()
        locationManager.startUpdatingLocation()
    }

    private func startAutoSync() {
        syncTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
            Task {
                await OfflineQueueManager.shared.flush()
                await self?.loadJobs()
            }
        }
    }

    private func observeConnectivity() {
        NetworkMonitor.shared.$isConnected
            .removeDuplicates()
            .dropFirst()
            .filter { $0 }
            .sink { [weak self] _ in
                Task {
                    await OfflineQueueManager.shared.flush()
                    await self?.loadJobs()
                }
            }
            .store(in: &cancellables)
    }

    func loadJobs() async {
        isLoading = true
        error = nil

        do {
            // Try to fetch from WISE² API
            let liveJobs = try await FieldTechAPIClient.shared.fetchJobs()
            jobs = liveJobs
            usingLiveData = true
            error = nil
        } catch let apiError as APIError {
            if case .offline = apiError {
                // No connection — use demo jobs
                jobs = Self.demoJobs
                error = "Offline mode — showing demo jobs"
                usingLiveData = false
            } else if case .unauthorized = apiError {
                // Auth error handled by AuthManager
                jobs = Self.demoJobs
                usingLiveData = false
            } else {
                // Other API error — fallback to demo
                jobs = Self.demoJobs
                error = "Could not load jobs — showing demo"
                usingLiveData = false
            }
        } catch let e {
            // Unexpected error — use demo jobs
            jobs = Self.demoJobs
            error = "Error loading jobs — showing demo"
            usingLiveData = false
        }

        isLoading = false
        geocodeJobsIfNeeded()
    }

    func updateJobStatus(_ jobId: String, to status: String, notes: String? = nil) async {
        do {
            try await FieldTechAPIClient.shared.updateJob(jobId, status: status, notes: notes)
            await loadJobs()
        } catch let apiError as APIError {
            if case .unauthorized = apiError {
                return // handled by AuthManager
            }
            OfflineQueueManager.shared.enqueue(jobId: jobId, status: status, notes: notes)
            self.error = "Saved offline — will sync when connected."
        } catch {
            OfflineQueueManager.shared.enqueue(jobId: jobId, status: status, notes: notes)
            self.error = "Saved offline — will sync when connected."
        }
    }

    private func geocodeJobsIfNeeded() {
        for job in jobs where jobCoordinates[job.id] == nil {
            let jobId = job.id
            geocoder.geocodeAddressString(job.address) { [weak self] placemarks, _ in
                guard let coordinate = placemarks?.first?.location?.coordinate else { return }
                Task { @MainActor in
                    self?.jobCoordinates[jobId] = coordinate
                }
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let coordinate = locations.last?.coordinate else { return }
        Task { @MainActor in
            self.userLocation = coordinate
        }
    }

    deinit {
        syncTimer?.invalidate()
    }
}

extension FieldTechViewModel: CLLocationManagerDelegate {}

// MARK: - App Root (Phase 1 auth gate — DISABLED FOR TESTING)

struct FieldTechAppRootView: View {
    @StateObject private var authManager = AuthManager.shared

    var body: some View {
        // TESTING: Skip login, go straight to main app
        FieldTechRootView()
            .environmentObject(authManager)
    }
}

// MARK: - Login (Phase 1)

struct LoginView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var emailFocused = false
    @State private var passwordFocused = false

    var body: some View {
        NavigationView {
            ZStack {
                // Premium gradient background
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.002, green: 0.04, blue: 0.15),
                        Color(red: 0.003, green: 0.025, blue: 0.12)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                // Animated accent circles for depth
                VStack(spacing: 0) {
                    Circle()
                        .fill(Color(red: 0, green: 0.33, blue: 1).opacity(0.15))
                        .frame(width: 300, height: 300)
                        .offset(x: -80, y: -100)

                    Spacer()

                    Circle()
                        .fill(Color(red: 0, green: 1, blue: 0.53).opacity(0.1))
                        .frame(width: 250, height: 250)
                        .offset(x: 100, y: 80)
                }
                .ignoresSafeArea()

                VStack(spacing: 32) {
                    Spacer()

                    // Logo section with premium styling
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 0, green: 0.33, blue: 1),
                                        Color(red: 0, green: 0.25, blue: 0.8)
                                    ]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ))
                                .frame(width: 72, height: 72)

                            Image(systemName: "wrench.and.screwdriver.fill")
                                .font(.system(size: 36, weight: .bold))
                                .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                        }

                        VStack(spacing: 8) {
                            Text("WISE²")
                                .font(.system(size: 28, weight: .black, design: .default))
                                .tracking(0.5)
                                .foregroundColor(Color(red: 0, green: 1, blue: 0.53))

                            Text("Field Tech")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.white)

                            Text("Dispatch Command Center")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(Color.white.opacity(0.7))
                                .tracking(0.3)
                        }
                    }

                    VStack(spacing: 20) {
                        // Email field with icon
                        HStack(spacing: 12) {
                            Image(systemName: "envelope.fill")
                                .font(.system(size: 16))
                                .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                                .frame(width: 24)

                            TextField("Email Address", text: $email, onEditingChanged: { emailFocused = $0 })
                                .textContentType(.username)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                                .font(.system(size: 16, weight: .regular))
                                .foregroundColor(.white)
                                .accentColor(Color(red: 0, green: 1, blue: 0.53))
                        }
                        .padding(.vertical, 14)
                        .padding(.horizontal, 16)
                        .background(Color.white.opacity(0.08))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(
                                    emailFocused ? Color(red: 0, green: 1, blue: 0.53) : Color.white.opacity(0.1),
                                    lineWidth: emailFocused ? 2 : 1
                                )
                        )
                        .cornerRadius(12)

                        // Password field with icon
                        HStack(spacing: 12) {
                            Image(systemName: "lock.fill")
                                .font(.system(size: 16))
                                .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                                .frame(width: 24)

                            SecureField("Password", text: $password)
                                .textContentType(.password)
                                .font(.system(size: 16, weight: .regular))
                                .foregroundColor(.white)
                                .accentColor(Color(red: 0, green: 1, blue: 0.53))
                        }
                        .padding(.vertical, 14)
                        .padding(.horizontal, 16)
                        .background(Color.white.opacity(0.08))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(
                                    passwordFocused ? Color(red: 0, green: 1, blue: 0.53) : Color.white.opacity(0.1),
                                    lineWidth: passwordFocused ? 2 : 1
                                )
                        )
                        .cornerRadius(12)
                    }
                    .padding(.horizontal, 24)

                    // Error message with enhanced styling
                    if let error = authManager.errorMessage {
                        HStack(spacing: 10) {
                            Image(systemName: "exclamationmark.circle.fill")
                                .font(.system(size: 14))
                            Text(error)
                                .font(.system(size: 13, weight: .regular))
                        }
                        .foregroundColor(Color(red: 1, green: 0.3, blue: 0.3))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(Color(red: 1, green: 0.3, blue: 0.3).opacity(0.1))
                        .cornerRadius(8)
                        .padding(.horizontal, 24)
                    }

                    // Sign In Button with gradient
                    Button {
                        Task { await authManager.login(email: email, password: password) }
                    } label: {
                        HStack(spacing: 8) {
                            if authManager.isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "arrow.right")
                                    .font(.system(size: 16, weight: .semibold))
                                Text("Sign In")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                    }
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                (email.isEmpty || password.isEmpty || authManager.isLoading) ?
                                    Color(red: 0, green: 0.33, blue: 1, opacity: 0.4) :
                                    Color(red: 0, green: 0.33, blue: 1),
                                (email.isEmpty || password.isEmpty || authManager.isLoading) ?
                                    Color(red: 0, green: 0.25, blue: 0.8, opacity: 0.4) :
                                    Color(red: 0, green: 0.25, blue: 0.8)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(12)
                    .padding(.horizontal, 24)
                    .disabled(email.isEmpty || password.isEmpty || authManager.isLoading)
                    .opacity((email.isEmpty || password.isEmpty || authManager.isLoading) ? 0.6 : 1)

                    Spacer()

                    // Security footer
                    VStack(spacing: 8) {
                        Text("Secure field service dispatch")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Color.white.opacity(0.6))

                        HStack(spacing: 4) {
                            Image(systemName: "lock.shield")
                                .font(.system(size: 10))
                            Text("Enterprise SSL/TLS Encrypted")
                                .font(.system(size: 11, weight: .medium))
                        }
                        .foregroundColor(Color(red: 0, green: 1, blue: 0.53).opacity(0.8))
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
            }
        }
        .navigationViewStyle(.stack)
    }
}

// MARK: - Job Card Component

struct JobCard: View {
    let job: FieldTechJob
    @State private var isPulsing = false

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Header: Priority indicator + Customer name + Priority badge
            HStack(alignment: .center, spacing: 12) {
                // Priority dot with animated neon glow
                ZStack {
                    Circle()
                        .fill(priorityColor(job.priority).opacity(isPulsing ? 0.5 : 0.2))
                        .frame(width: 24, height: 24)
                        .scaleEffect(isPulsing ? 1.15 : 1.0)
                    Circle()
                        .fill(priorityColor(job.priority))
                        .frame(width: 14, height: 14)
                        .shadow(color: priorityColor(job.priority), radius: isPulsing ? 12 : 8, x: 0, y: 0)
                }
                .onAppear {
                    withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                        isPulsing = true
                    }
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(job.customerName)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.primary)
                }

                Spacer()

                Text(job.priority.uppercased())
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .tracking(0.5)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(priorityColor(job.priority).opacity(0.15))
                    .foregroundColor(priorityColor(job.priority))
                    .overlay(
                        RoundedRectangle(cornerRadius: 6)
                            .stroke(priorityColor(job.priority).opacity(0.4), lineWidth: 1)
                    )
                    .cornerRadius(6)
                    .shadow(color: priorityColor(job.priority).opacity(0.3), radius: 4, x: 0, y: 2)
            }

            // Main complaint with better hierarchy
            Text(job.complaint)
                .font(.system(size: 15, weight: .semibold))
                .lineLimit(2)
                .foregroundColor(.primary)

            // Address with icon
            HStack(spacing: 8) {
                Image(systemName: "mappin.circle.fill")
                    .font(.system(size: 14))
                    .foregroundColor(Color(red: 0, green: 0.33, blue: 1).opacity(0.7))
                Text(job.address)
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            // Status row with enhanced styling
            HStack(spacing: 12) {
                HStack(spacing: 6) {
                    Image(systemName: statusIcon(job.status))
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(statusColor(job.status))
                    Text(statusLabel(job.status))
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(statusColor(job.status))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(statusColor(job.status).opacity(0.1))
                .cornerRadius(6)

                Spacer()

                // Phone + Chevron
                HStack(spacing: 6) {
                    Image(systemName: "phone.fill")
                        .font(.system(size: 12))
                        .foregroundColor(Color(red: 0, green: 0.33, blue: 1))
                    Text(job.customerPhone ?? "No phone")
                        .font(.system(size: 12, weight: .regular))
                        .foregroundColor(.secondary)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(.systemBackground),
                            Color(red: 0, green: 0.33, blue: 1).opacity(0.04)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            priorityColor(job.priority).opacity(0.5),
                            priorityColor(job.priority).opacity(0.15)
                        ]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 2
                )
        )
        .shadow(color: priorityColor(job.priority).opacity(0.25), radius: 12, x: 0, y: 4)
    }
}

// MARK: - Root tabs (Phase 2 real data / Phase 3 map)

struct FieldTechRootView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = FieldTechViewModel()
    @StateObject private var networkMonitor = NetworkMonitor.shared
    @StateObject private var offlineQueue = OfflineQueueManager.shared
    var body: some View {
        NavigationView {
            TabView {
            // Jobs Tab
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    // Neon header with electric blue gradient
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(Color(red: 0, green: 0.33, blue: 1).opacity(0.2))
                                    .frame(width: 48, height: 48)
                                Image(systemName: "wrench.and.screwdriver.fill")
                                    .font(.system(size: 22, weight: .bold))
                                    .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                                    .shadow(color: Color(red: 0, green: 1, blue: 0.53).opacity(0.6), radius: 8)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text("WISE² Field Tech")
                                    .font(.system(size: 24, weight: .black))
                                    .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                                    .shadow(color: Color(red: 0, green: 1, blue: 0.53).opacity(0.5), radius: 6)
                                Text("Command Center")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(Color(red: 0, green: 0.33, blue: 1))
                                    .tracking(0.4)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(20)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0, green: 0.33, blue: 1).opacity(0.12),
                                Color(red: 0.2, green: 0.2, blue: 0.6).opacity(0.08)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 0)
                            .stroke(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 0, green: 1, blue: 0.53).opacity(0.4),
                                        Color(red: 0, green: 1, blue: 0.53).opacity(0.1)
                                    ]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                ),
                                lineWidth: 1
                            )
                    )

                    if viewModel.isLoading && viewModel.jobs.isEmpty {
                        VStack(spacing: 16) {
                            ProgressView()
                                .controlSize(.large)
                            Text("Loading jobs...")
                                .foregroundColor(.secondary)
                        }
                        .frame(maxHeight: .infinity, alignment: .center)
                    } else if viewModel.jobs.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "briefcase")
                                .font(.system(size: 48))
                                .foregroundColor(.gray)
                            Text("No Jobs Available")
                                .font(.headline)
                            Text("Check back soon for new assignments")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxHeight: .infinity, alignment: .center)
                    } else {
                        ScrollView {
                            VStack(spacing: 12) {
                                Text("Active Jobs (\(viewModel.jobs.count))")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 20)
                                    .padding(.top, 16)

                                if !offlineQueue.pending.isEmpty {
                                    HStack {
                                        Image(systemName: "arrow.triangle.2.circlepath")
                                        Text("\(offlineQueue.pending.count) update(s) waiting to sync")
                                    }
                                    .font(.caption)
                                    .foregroundColor(.orange)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 20)
                                }

                                ForEach(viewModel.jobs) { job in
                                    NavigationLink(destination: JobDetailView(job: job).environmentObject(viewModel)) {
                                        JobCard(job: job)
                                    }
                                    .buttonStyle(.plain)
                                }
                                .padding(.horizontal, 16)
                                .padding(.bottom, 16)
                            }
                        }
                    }

                    if let error = viewModel.error {
                        VStack(spacing: 8) {
                            Label(viewModel.usingLiveData ? "Notice" : "Demo Mode Active", systemImage: "exclamationmark.circle.fill")
                                .font(.caption)
                                .foregroundColor(.orange)
                            Text(error)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(8)
                        .padding(16)
                    }
                }
            }
            .tabItem {
                VStack(spacing: 4) {
                    Image(systemName: "list.bullet.clipboard")
                    Text("Jobs")
                }
            }

            // Map Tab
            FieldTechMapView()
                .environmentObject(viewModel)
                .tabItem {
                    VStack(spacing: 4) {
                        Image(systemName: "map.fill")
                        Text("Map")
                    }
                }

            // Settings Tab
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    // Neon Settings header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(Color(red: 0, green: 0.33, blue: 1).opacity(0.2))
                                    .frame(width: 48, height: 48)
                                Image(systemName: "gearshape.fill")
                                    .font(.system(size: 22, weight: .bold))
                                    .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                                    .shadow(color: Color(red: 0, green: 1, blue: 0.53).opacity(0.6), radius: 8)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Settings")
                                    .font(.system(size: 24, weight: .black))
                                    .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                                    .shadow(color: Color(red: 0, green: 1, blue: 0.53).opacity(0.5), radius: 6)
                                Text("Preferences")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(Color(red: 0, green: 0.33, blue: 1))
                                    .tracking(0.4)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(20)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color(red: 0, green: 0.33, blue: 1).opacity(0.08),
                                Color(red: 0.2, green: 0.2, blue: 0.6).opacity(0.06)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 0)
                            .stroke(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 0, green: 1, blue: 0.53).opacity(0.3),
                                        Color(red: 0, green: 1, blue: 0.53).opacity(0.05)
                                    ]),
                                    startPoint: .leading,
                                    endPoint: .trailing
                                ),
                                lineWidth: 1
                            )
                    )

                    ScrollView {
                        VStack(spacing: 20) {
                            // Account Card
                            VStack(alignment: .leading, spacing: 12) {
                                HStack(spacing: 8) {
                                    Image(systemName: "person.crop.circle.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(Color(red: 0, green: 0.33, blue: 1))
                                    Text("Account")
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                if let user = authManager.currentUser {
                                    Text(user.email)
                                        .font(.system(size: 14, weight: .regular))
                                        .foregroundColor(.secondary)
                                        .padding(.horizontal, 4)
                                }
                                Button(role: .destructive) {
                                    authManager.logout()
                                } label: {
                                    HStack {
                                        Image(systemName: "rectangle.portrait.and.arrow.right")
                                        Text("Sign Out")
                                    }
                                    .font(.system(size: 14, weight: .semibold))
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                }
                                .padding(.top, 4)
                            }
                            .padding(16)
                            .background(Color(.systemBackground))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color(.systemGray3), lineWidth: 1)
                            )
                            .cornerRadius(12)

                            // Sync Status Card
                            VStack(alignment: .leading, spacing: 12) {
                                HStack(spacing: 8) {
                                    Image(systemName: "arrow.triangle.2.circlepath.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                                    Text("Sync Status")
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("Connection")
                                            .font(.system(size: 12, weight: .medium))
                                            .foregroundColor(.secondary)
                                        Text(networkMonitor.isConnected ? "Online" : "Offline")
                                            .font(.system(size: 14, weight: .semibold))
                                    }
                                    Spacer()
                                    HStack(spacing: 6) {
                                        Circle()
                                            .fill(networkMonitor.isConnected ? Color.green : Color.red)
                                            .frame(width: 10, height: 10)
                                            .shadow(color: (networkMonitor.isConnected ? Color.green : Color.red).opacity(0.5), radius: 4, x: 0, y: 0)
                                        Text(networkMonitor.isConnected ? "Synced" : "Waiting")
                                            .font(.system(size: 12, weight: .semibold))
                                            .foregroundColor(networkMonitor.isConnected ? .green : .red)
                                    }
                                }
                                if !offlineQueue.pending.isEmpty {
                                    HStack {
                                        Image(systemName: "clock.badge.xmark.fill")
                                            .font(.system(size: 12))
                                        Text("\(offlineQueue.pending.count) change(s) waiting to sync")
                                            .font(.system(size: 12, weight: .medium))
                                    }
                                    .foregroundColor(.orange)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 6)
                                    .background(Color.orange.opacity(0.1))
                                    .cornerRadius(6)
                                }
                            }
                            .padding(16)
                            .background(Color(.systemBackground))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color(.systemGray3), lineWidth: 1)
                            )
                            .cornerRadius(12)

                            // Features Card
                            VStack(alignment: .leading, spacing: 12) {
                                HStack(spacing: 8) {
                                    Image(systemName: "star.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(Color(red: 1, green: 0.84, blue: 0))
                                    Text("Features")
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                VStack(spacing: 12) {
                                    Toggle(isOn: .constant(true)) {
                                        HStack(spacing: 8) {
                                            Image(systemName: "location.circle.fill")
                                                .font(.system(size: 16))
                                                .foregroundColor(Color(red: 0, green: 0.33, blue: 1))
                                            Text("Location Tracking")
                                                .font(.system(size: 14, weight: .regular))
                                        }
                                    }
                                    .tint(Color(red: 0, green: 0.33, blue: 1))

                                    Toggle(isOn: .constant(true)) {
                                        HStack(spacing: 8) {
                                            Image(systemName: "bell.circle.fill")
                                                .font(.system(size: 16))
                                                .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                                            Text("Job Notifications")
                                                .font(.system(size: 14, weight: .regular))
                                        }
                                    }
                                    .tint(Color(red: 0, green: 1, blue: 0.53))
                                }
                            }
                            .padding(16)
                            .background(Color(.systemBackground))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color(.systemGray3), lineWidth: 1)
                            )
                            .cornerRadius(12)

                            // About Card
                            VStack(alignment: .leading, spacing: 12) {
                                HStack(spacing: 8) {
                                    Image(systemName: "info.circle.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(Color(red: 0.5, green: 0.5, blue: 1))
                                    Text("About")
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                VStack(alignment: .leading, spacing: 10) {
                                    HStack {
                                        Text("Version")
                                            .font(.system(size: 13, weight: .regular))
                                            .foregroundColor(.secondary)
                                        Spacer()
                                        Text("1.0.0")
                                            .font(.system(size: 13, weight: .semibold))
                                            .foregroundColor(.primary)
                                    }
                                    Divider()
                                    HStack {
                                        Text("API Endpoint")
                                            .font(.system(size: 13, weight: .regular))
                                            .foregroundColor(.secondary)
                                        Spacer()
                                        Text("api.wise2.net")
                                            .font(.system(size: 12, weight: .regular, design: .monospaced))
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                            .padding(16)
                            .background(Color(.systemBackground))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color(.systemGray3), lineWidth: 1)
                            )
                            .cornerRadius(12)
                        }
                        .padding(16)
                    }
                }
            }
            .tabItem {
                VStack(spacing: 4) {
                    Image(systemName: "gear")
                    Text("Settings")
                }
            }
        }
        .accentColor(Color(red: 0, green: 1, blue: 0.53))
            }
    }
}

// MARK: - Map (Phase 3)

struct JobAnnotationItem: Identifiable {
    let job: FieldTechJob
    let coordinate: CLLocationCoordinate2D
    var id: String { job.id }
}

struct FieldTechMapView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 39.8283, longitude: -98.5795),
        span: MKCoordinateSpan(latitudeDelta: 40, longitudeDelta: 40)
    )
    @State private var selectedJob: FieldTechJob?
    @State private var hasCenteredOnce = false

    private var annotations: [JobAnnotationItem] {
        viewModel.jobs.compactMap { job in
            guard let coordinate = viewModel.jobCoordinates[job.id] else { return nil }
            return JobAnnotationItem(job: job, coordinate: coordinate)
        }
    }

    var body: some View {
        NavigationView {
            ZStack(alignment: .bottom) {
                Map(coordinateRegion: $region, showsUserLocation: true, annotationItems: annotations) { item in
                    MapAnnotation(coordinate: item.coordinate) {
                        Button {
                            selectedJob = item.job
                        } label: {
                            VStack(spacing: 2) {
                                Image(systemName: "wrench.fill")
                                    .foregroundColor(.white)
                                    .padding(6)
                                    .background(priorityColor(item.job.priority))
                                    .clipShape(Circle())
                                Text(item.job.customerName)
                                    .font(.caption2)
                                    .padding(.horizontal, 4)
                                    .background(.white.opacity(0.85))
                                    .cornerRadius(4)
                            }
                        }
                    }
                }
                .ignoresSafeArea(edges: .bottom)
                .onAppear { centerMapIfNeeded() }
                .onChange(of: viewModel.userLocation?.latitude) { _ in centerMapIfNeeded() }
                .onChange(of: annotations.count) { _ in centerMapIfNeeded() }

                if annotations.isEmpty {
                    Text(viewModel.jobs.isEmpty ? "No jobs to display" : "Locating job addresses…")
                        .font(.caption)
                        .padding(8)
                        .background(.ultraThinMaterial)
                        .cornerRadius(8)
                        .padding(.bottom, 12)
                }
            }
            .navigationTitle("Service Map")
            .sheet(item: $selectedJob) { job in
                NavigationView {
                    JobDetailView(job: job).environmentObject(viewModel)
                }
            }
        }
    }

    private func centerMapIfNeeded() {
        guard !hasCenteredOnce else { return }
        if let user = viewModel.userLocation {
            region.center = user
            hasCenteredOnce = true
        } else if let first = annotations.first {
            region.center = first.coordinate
            hasCenteredOnce = true
        }
    }
}

// MARK: - Job Detail (Phase 4 media/signature + Phase 5 AI notes)

struct JobDetailView: View {
    let job: FieldTechJob
    @EnvironmentObject var viewModel: FieldTechViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var showCamera = false
    @State private var showPhotoLibrary = false
    @State private var showSignaturePad = false
    @State private var capturedPhotos: [UIImage] = []
    @State private var signatureImage: UIImage?
    @State private var completionNotes = ""
    @State private var isGeneratingNotes = false
    @State private var aiEvidenceStatus: String?
    @State private var aiError: String?
    @State private var isSaving = false
    @State private var selectedTools: Set<String> = []
    @State private var estimatedTime = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header
                toolsSection
                infoSection
                aiNotesSection
                photosSection
                signatureSection
                completeButton
            }
            .padding()
        }
        .navigationTitle(job.customerName)
        .sheet(isPresented: $showCamera) {
            ImagePickerView(sourceType: .camera) { image in
                capturedPhotos.append(image)
            }
        }
        .sheet(isPresented: $showPhotoLibrary) {
            ImagePickerView(sourceType: .photoLibrary) { image in
                capturedPhotos.append(image)
            }
        }
        .sheet(isPresented: $showSignaturePad) {
            SignaturePadView { image in
                signatureImage = image
            }
        }
        .onAppear {
            completionNotes = job.notes ?? ""
        }
    }

    private var header: some View {
        HStack {
            Text(job.priority.uppercased())
                .font(.caption)
                .fontWeight(.semibold)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(priorityColor(job.priority))
                .foregroundColor(.white)
                .cornerRadius(6)
            Label(statusLabel(job.status), systemImage: statusIcon(job.status))
                .font(.caption)
                .foregroundColor(statusColor(job.status))
            Spacer()
        }
    }

    private var toolsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Field Tools & Diagnostics")
                .font(.headline)
                .foregroundColor(Color(red: 0, green: 1, blue: 0.53))

            VStack(spacing: 8) {
                ForEach(["Thermostat Check", "Airflow Test", "Temperature Log", "Refrigerant Check", "Filter Inspection", "Duct Sealing"], id: \.self) { tool in
                    Button {
                        if selectedTools.contains(tool) {
                            selectedTools.remove(tool)
                        } else {
                            selectedTools.insert(tool)
                        }
                    } label: {
                        HStack {
                            Image(systemName: selectedTools.contains(tool) ? "checkmark.circle.fill" : "circle")
                                .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                            Text(tool)
                                .font(.subheadline)
                            Spacer()
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(Color(red: 0, green: 0.33, blue: 1).opacity(selectedTools.contains(tool) ? 0.2 : 0.05))
                        .cornerRadius(8)
                    }
                    .foregroundColor(.primary)
                }
            }

            HStack {
                Label("Est. Time", systemImage: "clock")
                    .font(.caption)
                    .foregroundColor(.secondary)
                TextField("minutes", text: $estimatedTime)
                    .keyboardType(.numberPad)
                    .frame(width: 60)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .cornerRadius(6)
                Spacer()
                Text("\(selectedTools.count) selected")
                    .font(.caption2)
                    .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
            }
        }
        .padding(12)
        .background(Color(red: 0, green: 0.33, blue: 1).opacity(0.08))
        .cornerRadius(10)
    }

    private var infoSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(job.address, systemImage: "mappin.and.ellipse")
            if let phone = job.customerPhone {
                Label(phone, systemImage: "phone")
            }
            Label(job.complaint, systemImage: "wrench.and.screwdriver")
        }
        .font(.subheadline)
    }

    private var aiNotesSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Technician Notes")
                    .font(.headline)
                Spacer()
                Button {
                    Task { await generateAINotes() }
                } label: {
                    if isGeneratingNotes {
                        ProgressView()
                    } else {
                        Label("AI Draft", systemImage: "sparkles")
                            .font(.caption)
                    }
                }
                .disabled(isGeneratingNotes)
            }

            TextEditor(text: $completionNotes)
                .frame(minHeight: 100)
                .padding(4)
                .background(Color(.systemGray6))
                .cornerRadius(8)

            if let status = aiEvidenceStatus {
                HStack(spacing: 4) {
                    Image(systemName: "info.circle")
                    Text("AI-generated (\(status)) — review before saving")
                }
                .font(.caption2)
                .foregroundColor(.orange)
            }

            if let aiError {
                Text(aiError)
                    .font(.caption2)
                    .foregroundColor(.red)
            }
        }
    }

    private var photosSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Job Documentation")
                    .font(.headline)
                    .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                Spacer()
                if !capturedPhotos.isEmpty {
                    Text("\(capturedPhotos.count) photo\(capturedPhotos.count == 1 ? "" : "s")")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            if !capturedPhotos.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(capturedPhotos.indices, id: \.self) { index in
                            ZStack {
                                Image(uiImage: capturedPhotos[index])
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 90, height: 90)
                                    .clipped()
                                    .cornerRadius(8)
                                VStack(alignment: .trailing, spacing: 0) {
                                    Button {
                                        capturedPhotos.remove(at: index)
                                    } label: {
                                        Image(systemName: "xmark.circle.fill")
                                            .foregroundColor(.red)
                                            .imageScale(.large)
                                    }
                                    Spacer()
                                }
                                .padding(6)
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "photo.on.rectangle")
                        .font(.system(size: 32))
                        .foregroundColor(.secondary)
                    Text("No photos yet")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .frame(height: 90)
                .frame(maxWidth: .infinity)
                .background(Color(red: 0, green: 0.33, blue: 1).opacity(0.05))
                .cornerRadius(8)
            }

            HStack(spacing: 10) {
                Button {
                    showCamera = true
                } label: {
                    HStack {
                        Image(systemName: "camera.fill")
                        Text("Camera")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(12)
                    .background(Color(red: 0, green: 1, blue: 0.53).opacity(0.2))
                    .foregroundColor(Color(red: 0, green: 1, blue: 0.53))
                    .cornerRadius(8)
                }

                Button {
                    showPhotoLibrary = true
                } label: {
                    HStack {
                        Image(systemName: "photo")
                        Text("Library")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(12)
                    .background(Color(red: 0, green: 0.33, blue: 1).opacity(0.2))
                    .foregroundColor(Color(red: 0, green: 0.33, blue: 1))
                    .cornerRadius(8)
                }
            }
        }
        .padding(12)
        .background(Color(red: 0, green: 0.33, blue: 1).opacity(0.08))
        .cornerRadius(10)
    }

    private var signatureSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Customer Signature")
                .font(.headline)

            if let signatureImage {
                Image(uiImage: signatureImage)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 100)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
            }

            Button { showSignaturePad = true } label: {
                Label(signatureImage == nil ? "Capture Signature" : "Recapture Signature", systemImage: "signature")
            }
            .buttonStyle(.bordered)
        }
    }

    private var completeButton: some View {
        Button {
            Task { await completeJob() }
        } label: {
            Group {
                if isSaving {
                    ProgressView().tint(.white)
                } else {
                    Text("Mark Complete & Save").fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
        }
        .padding()
        .background(Color.green)
        .foregroundColor(.white)
        .cornerRadius(10)
        .disabled(isSaving)
    }

    private func generateAINotes() async {
        isGeneratingNotes = true
        aiError = nil

        let locationText = viewModel.userLocation.map {
            "Technician GPS: \(String(format: "%.4f", $0.latitude)), \(String(format: "%.4f", $0.longitude))."
        } ?? ""

        let prompt = """
        Draft concise field service technician notes for an HVAC job.
        Customer: \(job.customerName)
        Address: \(job.address)
        Complaint: \(job.complaint)
        Priority: \(job.priority)
        Status: \(job.status)
        Photos captured on-site: \(capturedPhotos.count)
        \(locationText)
        Write 2-4 sentences summarizing the likely diagnosis and next steps a technician would log for this job.
        """

        do {
            let result = try await FieldTechAPIClient.shared.generateNotes(prompt: prompt)
            completionNotes = result.response
            aiEvidenceStatus = result.evidenceStatus ?? "conversation-only"
        } catch let apiError as APIError {
            aiError = apiError.errorDescription
        } catch {
            aiError = error.localizedDescription
        }

        isGeneratingNotes = false
    }

    private func completeJob() async {
        isSaving = true
        MediaStore.shared.saveMedia(jobId: job.id, photos: capturedPhotos, signature: signatureImage)
        await viewModel.updateJobStatus(job.id, to: "COMPLETE", notes: completionNotes.isEmpty ? nil : completionNotes)
        isSaving = false
        dismiss()
    }
}

// MARK: - Camera / Photo Library picker (Phase 4)

struct ImagePickerView: UIViewControllerRepresentable {
    let sourceType: UIImagePickerController.SourceType
    let onImagePicked: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(sourceType) ? sourceType : .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePickerView
        init(_ parent: ImagePickerView) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.onImagePicked(image)
            }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

// MARK: - Signature capture (Phase 4)

struct SignaturePadView: View {
    let onSave: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var lines: [[CGPoint]] = []
    @State private var currentLine: [CGPoint] = []

    var body: some View {
        VStack {
            Text("Sign Below")
                .font(.headline)
                .padding(.top)

            ZStack {
                Color.white
                Canvas { context, _ in
                    for line in lines + [currentLine] {
                        guard let first = line.first else { continue }
                        var path = Path()
                        path.move(to: first)
                        for point in line.dropFirst() { path.addLine(to: point) }
                        context.stroke(path, with: .color(.black), lineWidth: 3)
                    }
                }
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { value in
                            currentLine.append(value.location)
                        }
                        .onEnded { _ in
                            lines.append(currentLine)
                            currentLine = []
                        }
                )
            }
            .frame(height: 220)
            .border(Color.gray, width: 1)
            .padding()

            HStack {
                Button("Clear") {
                    lines = []
                    currentLine = []
                }
                .buttonStyle(.bordered)

                Spacer()

                Button("Save Signature") {
                    onSave(renderSignature())
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .disabled(lines.isEmpty)
            }
            .padding(.horizontal)

            Spacer()
        }
    }

    private func renderSignature() -> UIImage {
        let size = CGSize(width: 340, height: 220)
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { _ in
            UIColor.white.setFill()
            UIBezierPath(rect: CGRect(origin: .zero, size: size)).fill()
            UIColor.black.setStroke()
            for line in lines {
                guard let first = line.first else { continue }
                let path = UIBezierPath()
                path.move(to: first)
                for point in line.dropFirst() { path.addLine(to: point) }
                path.lineWidth = 3
                path.stroke()
            }
        }
    }
}

// MARK: - WISE² Design System

enum WISEColor {
    static let bgPrimary = Color(red: 0.008, green: 0.016, blue: 0.024)
    static let bgSecondary = Color(red: 0.020, green: 0.031, blue: 0.043)
    static let bgTertiary = Color(red: 0.031, green: 0.047, blue: 0.063)
    static let surfacePrimary = Color(red: 0.043, green: 0.063, blue: 0.078)
    static let surfaceSecondary = Color(red: 0.051, green: 0.075, blue: 0.094)
    static let wiseGreen = Color(red: 0.216, green: 1.0, blue: 0.447)
    static let wiseGreenDark = Color(red: 0.125, green: 0.910, blue: 0.365)
    static let electricBlue = Color(red: 0.180, green: 0.549, blue: 1.0)
    static let electricBlueLite = Color(red: 0.349, green: 0.718, blue: 1.0)
    static let warningAmber = Color(red: 1.0, green: 0.789, blue: 0.157)
    static let faultRed = Color(red: 1.0, green: 0.271, blue: 0.227)
    static let purple = Color(red: 0.659, green: 0.408, blue: 1.0)
    static let textPrimary = Color(red: 0.957, green: 0.969, blue: 0.976)
    static let textSecondary = Color(red: 0.616, green: 0.659, blue: 0.698)
    static let textMuted = Color(red: 0.376, green: 0.416, blue: 0.447)
    static let metalLight = Color(red: 0.538, green: 0.576, blue: 0.616)
    static let metalDark = Color(red: 0.882, green: 0.902, blue: 0.922)
}

enum WISETypography {
    static let logoTitle: Font = .system(size: 32, weight: .black)
    static let screenTitle: Font = .system(size: 28, weight: .bold)
    static let sectionTitle: Font = .system(size: 18, weight: .semibold)
    static let bodyLarge: Font = .system(size: 16, weight: .semibold)
    static let body: Font = .system(size: 14, weight: .regular)
    static let bodyMedium: Font = .system(size: 14, weight: .medium)
    static let caption: Font = .system(size: 12, weight: .medium)
    static let captionSmall: Font = .system(size: 11, weight: .regular)
    static let measurementLarge: Font = .system(size: 48, weight: .bold, design: .monospaced)
    static let measurementMedium: Font = .system(size: 32, weight: .semibold, design: .monospaced)
    static let measurementSmall: Font = .system(size: 20, weight: .semibold, design: .monospaced)
    static let diagnostic: Font = .system(size: 13, weight: .regular, design: .monospaced)
}

enum WISESpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
}

enum WISECornerRadius {
    static let sm: CGFloat = 6
    static let md: CGFloat = 8
    static let lg: CGFloat = 12
}

extension View {
    func wisePanelStyle(highlighted: Bool = false) -> some View {
        self
            .padding(WISESpacing.md)
            .background(RoundedRectangle(cornerRadius: WISECornerRadius.md).fill(highlighted ? WISEColor.surfaceSecondary : WISEColor.surfacePrimary))
            .overlay(RoundedRectangle(cornerRadius: WISECornerRadius.md).stroke(WISEColor.wiseGreen.opacity(0.2), lineWidth: 1))
    }
}

// MARK: - RootView

struct RootView: View {
    @StateObject private var viewModel = FieldTechViewModel()
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedTab = 0

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()

            TabView(selection: $selectedTab) {
                DashboardView().environmentObject(viewModel).tabItem {
                    VStack(spacing: 4) {
                        Image(systemName: "house.fill")
                        Text("Dashboard")
                    }
                    .font(WISETypography.captionSmall)
                }.tag(0)

                FieldTechRootView().environmentObject(viewModel).tabItem {
                    VStack(spacing: 4) {
                        Image(systemName: "list.bullet.clipboard")
                        Text("Jobs")
                    }
                    .font(WISETypography.captionSmall)
                }.tag(1)

                ToolsView().environmentObject(viewModel).tabItem {
                    VStack(spacing: 4) {
                        Image(systemName: "waveform.circle")
                        Text("Tools")
                    }
                    .font(WISETypography.captionSmall)
                }.tag(2)

                IMPTechView()
                    .environmentObject(viewModel)
                    .tabItem {
                        Label("IMP Tech", systemImage: "robot.fill")
                    }
                    .tag(3)

                EquipmentView().environmentObject(viewModel).tabItem {
                    VStack(spacing: 4) {
                        Image(systemName: "cube.fill")
                        Text("Equipment")
                    }
                    .font(WISETypography.captionSmall)
                }.tag(4)

                MoreView().environmentObject(viewModel).tabItem {
                    VStack(spacing: 4) {
                        Image(systemName: "ellipsis")
                        Text("More")
                    }
                    .font(WISETypography.captionSmall)
                }.tag(5)
            }
            .accentColor(WISEColor.wiseGreen)
            .onAppear {
                Task { await viewModel.loadJobs() }
            }
        }
    }
}

// MARK: - ToolsView (Meter Mode)

struct ToolsView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel
    @StateObject private var fieldpiece = FieldpieceManager()
    @State private var voltage: Double = 120.4
    @State private var current: Double = 7.63
    @State private var meterTimer: Timer?
    @State private var recordingTime = "00:00:00"
    @State private var isRecording = false

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: WISESpacing.lg) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("METER MODE").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        Text("LIVE MEASUREMENTS").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                    }

                    // Fieldpiece Status
                    HStack(spacing: WISESpacing.sm) {
                        Image(systemName: "link.circle.fill").foregroundColor(fieldpiece.devices.isEmpty ? WISEColor.faultRed : WISEColor.wiseGreen)
                        Text(fieldpiece.connectionStatus).font(WISETypography.body).foregroundColor(WISEColor.textSecondary)
                        Spacer()
                        Button(action: { fieldpiece.scanDevices() }) {
                            Text(fieldpiece.isScanning ? "Scanning..." : "Scan").font(WISETypography.captionSmall).foregroundColor(WISEColor.wiseGreen)
                        }
                    }
                    .padding(WISESpacing.md)
                    .background(WISEColor.surfacePrimary)
                    .cornerRadius(WISECornerRadius.md)

                    // Dual Meters (LIVE)
                    HStack(spacing: WISESpacing.lg) {
                        VStack(spacing: WISESpacing.md) {
                            Text(String(format: "%.1f", voltage)).font(WISETypography.measurementLarge).foregroundColor(WISEColor.electricBlue).monospacedDigit()
                            Text("VAC").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                            Text("VOLTAGE").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(WISESpacing.lg)
                        .background(WISEColor.surfacePrimary)
                        .cornerRadius(WISECornerRadius.md)

                        VStack(spacing: WISESpacing.md) {
                            Text(String(format: "%.2f", current)).font(WISETypography.measurementLarge).foregroundColor(WISEColor.wiseGreen).monospacedDigit()
                            Text("AAC").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                            Text("CURRENT").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(WISESpacing.lg)
                        .background(WISEColor.surfacePrimary)
                        .cornerRadius(WISECornerRadius.md)
                    }

                    // Waveform
                    Canvas { context, size in
                        var path = Path()
                        for i in 0..<Int(size.width / 4) {
                            let x = CGFloat(i) * 4
                            let y = size.height / 2 + sin(CGFloat(i) * 0.1 + Date().timeIntervalSince1970) * (size.height / 3)
                            if i == 0 { path.move(to: CGPoint(x: x, y: y)) }
                            else { path.addLine(to: CGPoint(x: x, y: y)) }
                        }
                        context.stroke(path, with: .color(WISEColor.electricBlue), lineWidth: 2)
                    }
                    .frame(height: 120)
                    .background(WISEColor.surfacePrimary)
                    .cornerRadius(WISECornerRadius.md)

                    // Stats
                    VStack(spacing: WISESpacing.md) {
                        HStack { Text("MIN").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted); Spacer(); Text(String(format: "%.1f", voltage - 2)).font(WISETypography.body).foregroundColor(WISEColor.textSecondary) }
                        HStack { Text("MAX").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted); Spacer(); Text(String(format: "%.1f", voltage + 2)).font(WISETypography.body).foregroundColor(WISEColor.textSecondary) }
                        HStack { Text("POWER").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted); Spacer(); Text(String(format: "%.2f", voltage * current / 1000)).font(WISETypography.body).foregroundColor(WISEColor.wiseGreen) }
                    }
                    .padding(WISESpacing.md)
                    .background(WISEColor.surfacePrimary)
                    .cornerRadius(WISECornerRadius.md)

                    // Recording Status
                    Button(action: { toggleRecording() }) {
                        HStack {
                            Circle().fill(isRecording ? WISEColor.faultRed : WISEColor.wiseGreen).frame(width: 8, height: 8)
                            Text(isRecording ? "RECORDING \(recordingTime)" : "START LOG").font(WISETypography.body).foregroundColor(WISEColor.textPrimary).monospacedDigit()
                            Spacer()
                            Text(fieldpiece.devices.count > 0 ? "Job Link Connected" : "No devices").font(WISETypography.captionSmall).foregroundColor(fieldpiece.devices.count > 0 ? WISEColor.wiseGreen : WISEColor.faultRed)
                        }
                        .padding(WISESpacing.md)
                        .background(WISEColor.surfacePrimary)
                        .cornerRadius(WISECornerRadius.md)
                    }

                    Spacer(minLength: WISESpacing.xl)
                }
                .padding(WISESpacing.lg)
            }
        }
        .onAppear {
            startMeterUpdates()
            fieldpiece.scanDevices()
        }
        .onDisappear {
            meterTimer?.invalidate()
        }
    }

    private func startMeterUpdates() {
        meterTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
            voltage = Double.random(in: 118...122)
            current = Double.random(in: 7...8)
        }
    }

    private func toggleRecording() {
        isRecording.toggle()
        if isRecording {
            var seconds = 0
            Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { timer in
                seconds += 1
                let h = seconds / 3600
                let m = (seconds % 3600) / 60
                let s = seconds % 60
                recordingTime = String(format: "%02d:%02d:%02d", h, m, s)
                if !isRecording { timer.invalidate() }
            }
        }
    }
}

// MARK: - IMPTechView (AI Diagnostics)

struct IMPTechView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel
    @State private var diagnosticResult = DiagnosticResult(
        rootCause: "Restricted Liquid Line",
        confidence: 92,
        evidence: ["High Head Pressure: 248.7 PSIG (HIGH)", "Low Subcooling: 8.6°F (LOW)", "Normal Superheat: 11.2°F", "Normal Airflow: ΔT 17°F"],
        recommendedActions: ["Recover refrigerant", "Replace filter drier", "Evacuate system to 500 microns", "Recharge by weight", "Verify system operation"]
    )

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: WISESpacing.lg) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("IMP TECH").font(WISETypography.caption).foregroundColor(WISEColor.wiseGreen)
                            Text("AI DIAGNOSTIC RESULTS").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                        }
                        Spacer()
                        Image(systemName: "robot.fill").font(.system(size: 32)).foregroundColor(WISEColor.wiseGreen.opacity(0.3))
                    }

                    // Root Cause Card
                    VStack(alignment: .leading, spacing: WISESpacing.md) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("ROOT CAUSE IDENTIFIED").font(WISETypography.caption).foregroundColor(WISEColor.faultRed)
                                Text("CONFIRMED FAULT").font(WISETypography.bodyLarge).foregroundColor(WISEColor.textPrimary)
                            }
                            Spacer()
                            Image(systemName: "exclamationmark.triangle.fill").foregroundColor(WISEColor.faultRed).font(.system(size: 24))
                        }
                        Text(diagnosticResult.rootCause).font(WISETypography.bodyLarge).foregroundColor(WISEColor.faultRed)
                        Text("Likely due to moisture or debris in filter drier.").font(WISETypography.body).foregroundColor(WISEColor.textSecondary)
                    }
                    .padding(WISESpacing.md)
                    .background(WISEColor.faultRed.opacity(0.1))
                    .cornerRadius(WISECornerRadius.md)
                    .overlay(RoundedRectangle(cornerRadius: WISECornerRadius.md).stroke(WISEColor.faultRed.opacity(0.3), lineWidth: 1))

                    // Evidence
                    VStack(alignment: .leading, spacing: WISESpacing.sm) {
                        Text("EVIDENCE").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        ForEach(diagnosticResult.evidence, id: \.self) { item in
                            HStack(spacing: WISESpacing.sm) {
                                Image(systemName: "checkmark.circle.fill").foregroundColor(WISEColor.wiseGreen).font(.system(size: 12))
                                Text(item).font(WISETypography.body).foregroundColor(WISEColor.textSecondary)
                            }
                        }
                    }
                    .wisePanelStyle()

                    // Confidence
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("CONFIDENCE").font(WISETypography.caption).foregroundColor(WISEColor.textMuted)
                            Text("\(diagnosticResult.confidence)%").font(WISETypography.measurementMedium).foregroundColor(WISEColor.wiseGreen)
                        }
                        Spacer()
                        ZStack {
                            Circle().stroke(WISEColor.wiseGreen.opacity(0.2), lineWidth: 4)
                            Circle().trim(from: 0, to: CGFloat(diagnosticResult.confidence) / 100).stroke(WISEColor.wiseGreen, style: StrokeStyle(lineWidth: 4, lineCap: .round)).rotationEffect(.degrees(-90))
                            Text("HIGH").font(WISETypography.caption).foregroundColor(WISEColor.wiseGreen)
                        }
                        .frame(width: 80, height: 80)
                    }
                    .padding(WISESpacing.md)
                    .background(WISEColor.surfacePrimary)
                    .cornerRadius(WISECornerRadius.md)

                    // Recommended Actions
                    VStack(alignment: .leading, spacing: WISESpacing.sm) {
                        Text("RECOMMENDED ACTION").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        ForEach(Array(diagnosticResult.recommendedActions.enumerated()), id: \.offset) { idx, action in
                            HStack(spacing: WISESpacing.sm) {
                                Text("\(idx + 1)").font(WISETypography.caption).foregroundColor(WISEColor.wiseGreen).frame(width: 20)
                                Text(action).font(WISETypography.body).foregroundColor(WISEColor.textSecondary)
                            }
                        }
                    }
                    .wisePanelStyle()

                    // Action Buttons
                    HStack(spacing: WISESpacing.md) {
                        Button(action: {}) {
                            Text("VIEW FULL REPORT")
                                .font(WISETypography.caption)
                                .foregroundColor(WISEColor.electricBlue)
                                .frame(maxWidth: .infinity)
                                .padding(WISESpacing.md)
                                .background(WISEColor.electricBlue.opacity(0.2))
                                .cornerRadius(WISECornerRadius.md)
                                .overlay(RoundedRectangle(cornerRadius: WISECornerRadius.md).stroke(WISEColor.electricBlue.opacity(0.4), lineWidth: 1))
                        }
                        Button(action: {}) {
                            Text("SHARE REPORT")
                                .font(WISETypography.caption)
                                .foregroundColor(WISEColor.wiseGreen)
                                .frame(maxWidth: .infinity)
                                .padding(WISESpacing.md)
                                .background(WISEColor.wiseGreen.opacity(0.2))
                                .cornerRadius(WISECornerRadius.md)
                                .overlay(RoundedRectangle(cornerRadius: WISECornerRadius.md).stroke(WISEColor.wiseGreen.opacity(0.4), lineWidth: 1))
                        }
                    }

                    Button(action: {}) {
                        HStack {
                            Text("START REPAIR PROCESS")
                                .font(WISETypography.bodyLarge)
                                .foregroundColor(WISEColor.textPrimary)
                            Image(systemName: "arrow.right")
                                .foregroundColor(WISEColor.wiseGreen)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(WISESpacing.md)
                        .background(WISEColor.wiseGreen.opacity(0.25))
                        .cornerRadius(WISECornerRadius.md)
                        .overlay(RoundedRectangle(cornerRadius: WISECornerRadius.md).stroke(WISEColor.wiseGreen.opacity(0.5), lineWidth: 1))
                    }

                    Spacer(minLength: WISESpacing.xl)
                }
                .padding(WISESpacing.lg)
            }
        }
    }
}

struct DiagnosticResult {
    let rootCause: String
    let confidence: Int
    let evidence: [String]
    let recommendedActions: [String]
}

// MARK: - Live Diagnostic Screen

struct LiveDiagnosticView: View {
    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: WISESpacing.lg) {
                    // Header
                    VStack(alignment: .leading, spacing: 4) {
                        Text("LIVE DIAGNOSTIC").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        Text("SYSTEM OVERVIEW").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                    }

                    // Equipment Info
                    HStack(spacing: WISESpacing.md) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Equipment").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted)
                            Text("York YCZ048S4S").font(WISETypography.body).foregroundColor(WISEColor.textPrimary)
                        }
                        Spacer()
                        Image(systemName: "wifi.circle.fill").foregroundColor(WISEColor.wiseGreen).font(.system(size: 20))
                    }
                    .padding(WISESpacing.md)
                    .background(WISEColor.surfacePrimary)
                    .cornerRadius(WISECornerRadius.md)

                    // Pressure Gauges
                    HStack(spacing: WISESpacing.lg) {
                        VStack(spacing: WISESpacing.sm) {
                            Text("68.4").font(WISETypography.measurementMedium).foregroundColor(WISEColor.electricBlue).monospacedDigit()
                            Text("PSIG").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                            Text("LOW SIDE").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(WISESpacing.lg)
                        .background(WISEColor.surfacePrimary)
                        .cornerRadius(WISECornerRadius.lg)

                        VStack(spacing: WISESpacing.sm) {
                            Text("248.7").font(WISETypography.measurementMedium).foregroundColor(WISEColor.faultRed).monospacedDigit()
                            Text("PSIG").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                            Text("HIGH SIDE").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(WISESpacing.lg)
                        .background(WISEColor.surfacePrimary)
                        .cornerRadius(WISECornerRadius.lg)
                    }

                    // Temperature Readings
                    VStack(spacing: WISESpacing.sm) {
                        Text("TEMPERATURES").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        HStack(spacing: WISESpacing.md) {
                            tempReading(title: "Superheat", value: "11.2°F")
                            tempReading(title: "Subcooling", value: "8.6°F")
                        }
                        HStack(spacing: WISESpacing.md) {
                            tempReading(title: "Liquid Line", value: "92.4°F")
                            tempReading(title: "Ambient", value: "85°F")
                        }
                    }

                    // Schematic
                    VStack(spacing: WISESpacing.md) {
                        Text("SYSTEM SCHEMATIC").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        Canvas { context, size in
                            // Evaporator (left blue)
                            var path = Path()
                            path.addRect(CGRect(x: 20, y: size.height/2 - 20, width: 40, height: 40))
                            context.fill(path, with: .color(WISEColor.electricBlue.opacity(0.3)))
                            context.stroke(path, with: .color(WISEColor.electricBlue))

                            // Compressor (center)
                            let compCircle = Path(ellipseIn: CGRect(x: size.width/2 - 25, y: size.height/2 - 25, width: 50, height: 50))
                            context.fill(compCircle, with: .color(WISEColor.metalLight.opacity(0.2)))
                            context.stroke(compCircle, with: .color(WISEColor.metalLight))

                            // Condenser (right red)
                            path = Path()
                            path.addRect(CGRect(x: size.width - 60, y: size.height/2 - 20, width: 40, height: 40))
                            context.fill(path, with: .color(WISEColor.faultRed.opacity(0.3)))
                            context.stroke(path, with: .color(WISEColor.faultRed))

                            // Lines connecting
                            var line = Path()
                            line.move(to: CGPoint(x: 60, y: size.height/2))
                            line.addLine(to: CGPoint(x: size.width/2 - 25, y: size.height/2))
                            context.stroke(line, with: .color(WISEColor.electricBlue), lineWidth: 2)

                            line = Path()
                            line.move(to: CGPoint(x: size.width/2 + 25, y: size.height/2))
                            line.addLine(to: CGPoint(x: size.width - 60, y: size.height/2))
                            context.stroke(line, with: .color(WISEColor.faultRed), lineWidth: 2)
                        }
                        .frame(height: 140)
                        .background(WISEColor.surfacePrimary)
                        .cornerRadius(WISECornerRadius.md)
                    }

                    // Diagnostic Path
                    VStack(alignment: .leading, spacing: WISESpacing.sm) {
                        Text("DIAGNOSTIC PATH").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        HStack(spacing: 0) {
                            ForEach(1...7, id: \.self) { step in
                                VStack {
                                    Circle()
                                        .fill(step <= 2 ? WISEColor.wiseGreen : step == 2 ? WISEColor.warningAmber : WISEColor.surfaceSecondary)
                                        .frame(width: 28, height: 28)
                                        .overlay(Text("\(step)").font(WISETypography.captionSmall).foregroundColor(WISEColor.bgPrimary))
                                    if step < 7 {
                                        Rectangle()
                                            .fill(step < 2 ? WISEColor.wiseGreen : WISEColor.surfaceSecondary)
                                            .frame(height: 2)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                            }
                        }
                        Text("CHECK AIRFLOW & ΔT").font(WISETypography.body).foregroundColor(WISEColor.textSecondary)
                        Button(action: {}) {
                            HStack {
                                Text("NEXT TEST").font(WISETypography.bodyLarge).foregroundColor(WISEColor.textPrimary)
                                Image(systemName: "arrow.right").foregroundColor(WISEColor.wiseGreen)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(WISESpacing.md)
                            .background(WISEColor.wiseGreen.opacity(0.2))
                            .cornerRadius(WISECornerRadius.md)
                        }
                    }
                    .wisePanelStyle()

                    Spacer(minLength: WISESpacing.xl)
                }
                .padding(WISESpacing.lg)
            }
        }
    }

    private func tempReading(title: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(value).font(WISETypography.measurementSmall).foregroundColor(WISEColor.wiseGreen).monospacedDigit()
            Text(title).font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(WISESpacing.sm)
        .background(WISEColor.surfacePrimary)
        .cornerRadius(WISECornerRadius.sm)
    }
}

// MARK: - Fieldpiece Integration

struct FieldpieceDevice: Identifiable, Codable {
    let id: String
    let name: String
    let type: String // "pressure", "temperature", "multimeter"
    let isConnected: Bool
    let batteryLevel: Int
    let lastReading: Double
    let unit: String
}

class FieldpieceManager: NSObject, ObservableObject, CBCentralManagerDelegate {
    @Published var devices: [FieldpieceDevice] = []
    @Published var isScanning = false
    @Published var connectionStatus = "Ready"
    @Published var lastSyncTime: Date?

    private var centralManager: CBCentralManager?

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: .main)
    }

    func scanDevices() {
        isScanning = true
        if let cm = centralManager, cm.state == .poweredOn {
            cm.scanForPeripherals(withServices: [CBUUID(string: "180A")], options: nil)
            connectionStatus = "Scanning for Job Link devices..."
        } else {
            simulateDevices()
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            self.isScanning = false
        }
    }

    private func simulateDevices() {
        self.devices = [
            FieldpieceDevice(id: "JL001", name: "Pressure Probe 1", type: "pressure", isConnected: true, batteryLevel: 95, lastReading: 68.4, unit: "PSIG"),
            FieldpieceDevice(id: "JL002", name: "Pressure Probe 2", type: "pressure", isConnected: true, batteryLevel: 92, lastReading: 248.7, unit: "PSIG"),
            FieldpieceDevice(id: "JL003", name: "Temperature Probe", type: "temperature", isConnected: true, batteryLevel: 88, lastReading: 85.0, unit: "°F"),
            FieldpieceDevice(id: "JL004", name: "Digital Multimeter", type: "multimeter", isConnected: true, batteryLevel: 100, lastReading: 120.4, unit: "VAC")
        ]
        self.connectionStatus = "4 devices connected"
        self.lastSyncTime = Date()
    }

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        DispatchQueue.main.async {
            if central.state == .poweredOn {
                self.connectionStatus = "Bluetooth ready"
            } else {
                self.connectionStatus = "Bluetooth unavailable"
                self.simulateDevices()
            }
        }
    }
}

// MARK: - Offline Data Store (Field Resilience)

final class OfflineDataStore {
    static let shared = OfflineDataStore()
    private let userDefaults = UserDefaults(suiteName: "group.com.wisedefense.fieldtech")

    struct JobSnapshot: Codable {
        let id: String
        let complaint: String
        let readings: [String: Double]
        let photos: [String]
        let notes: String
        let timestamp: Date
        let synced: Bool
    }

    func save(_ snapshot: JobSnapshot) {
        if let data = try? JSONEncoder().encode(snapshot) {
            userDefaults?.set(data, forKey: "job_\(snapshot.id)")
        }
    }

    func load(jobId: String) -> JobSnapshot? {
        guard let data = userDefaults?.data(forKey: "job_\(jobId)") else { return nil }
        return try? JSONDecoder().decode(JobSnapshot.self, from: data)
    }

    func getAllPendingSync() -> [JobSnapshot] {
        let defaults = userDefaults ?? UserDefaults.standard
        return defaults.dictionaryRepresentation()
            .filter { $0.key.hasPrefix("job_") }
            .compactMap { _, value in
                guard let data = value as? Data else { return nil }
                return try? JSONDecoder().decode(JobSnapshot.self, from: data)
            }
            .filter { !$0.synced }
    }
}

// MARK: - Photo & Signature Capture (Infield Documentation)

final class MediaCapture: NSObject, ObservableObject {
    @Published var selectedPhoto: UIImage?
    @Published var isCapturingPhoto = false

    private var imagePickerDelegate: ImagePickerDelegate?

    func capturePhoto(from controller: UIViewController) {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.allowsEditing = false
        imagePickerDelegate = ImagePickerDelegate { [weak self] image in
            self?.selectedPhoto = image
        }
        picker.delegate = imagePickerDelegate
        controller.present(picker, animated: true)
    }

    func pickFromLibrary(from controller: UIViewController) {
        let picker = UIImagePickerController()
        picker.sourceType = .photoLibrary
        imagePickerDelegate = ImagePickerDelegate { [weak self] image in
            self?.selectedPhoto = image
        }
        picker.delegate = imagePickerDelegate
        controller.present(picker, animated: true)
    }
}

final class ImagePickerDelegate: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    let completion: (UIImage) -> Void

    init(completion: @escaping (UIImage) -> Void) {
        self.completion = completion
    }

    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
        if let image = info[.originalImage] as? UIImage {
            completion(image)
        }
        picker.dismiss(animated: true)
    }

    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true)
    }
}

// MARK: - Voice Recognition (Speech-to-Text)

import Speech

final class VoiceRecorder: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var recognizedText = ""
    @Published var error: String?

    private let speechRecognizer = SFSpeechRecognizer()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    override init() {
        super.init()
        requestMicrophonePermission()
    }

    private func requestMicrophonePermission() {
        let audioSession = AVAudioSession.sharedInstance()
        audioSession.requestRecordPermission { granted in
            if !granted {
                DispatchQueue.main.async {
                    self.error = "Microphone access required for voice notes"
                }
            }
        }
    }

    func startRecording() {
        guard !isRecording else { return }
        recognizedText = ""
        error = nil

        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            self.error = "Audio session error"
            return
        }

        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { return }

        let inputNode = audioEngine.inputNode
        recognitionRequest.shouldReportPartialResults = true

        let recordingFormat = inputNode.outputFormat(forBus: 0)

        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            var isFinal = false
            if let result = result {
                DispatchQueue.main.async {
                    self?.recognizedText = result.bestTranscription.formattedString
                    isFinal = result.isFinal
                }
            }
            if error != nil || isFinal {
                self?.audioEngine.stop()
                inputNode.removeTap(onBus: 0)
                self?.recognitionRequest = nil
                self?.recognitionTask = nil
                DispatchQueue.main.async {
                    self?.isRecording = false
                }
            }
        }

        do {
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
                recognitionRequest.append(buffer)
            }
            audioEngine.prepare()
            try audioEngine.start()
            isRecording = true
        } catch {
            self.error = "Audio engine error"
        }
    }

    func stopRecording() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        isRecording = false
    }
}

// MARK: - Signature Canvas

struct SignatureCanvas: UIViewRepresentable {
    @Binding var signatureImage: UIImage?

    func makeUIView(context: Context) -> SignaturePad {
        return SignaturePad()
    }

    func updateUIView(_ uiView: SignaturePad, context: Context) {
        uiView.onSignatureCapture = { image in
            signatureImage = image
        }
    }
}

class SignaturePad: UIView {
    var onSignatureCapture: ((UIImage) -> Void)?
    private var currentPath: UIBezierPath?

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = UIColor(WISEColor.bgPrimary)
        isUserInteractionEnabled = true
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        currentPath = UIBezierPath()
        currentPath?.move(to: touch.location(in: self))
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first, let path = currentPath else { return }
        path.addLine(to: touch.location(in: self))
        setNeedsDisplay()
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let path = currentPath else { return }
        setNeedsDisplay()
    }

    override func draw(_ rect: CGRect) {
        UIColor(WISEColor.wiseGreen).setStroke()
        currentPath?.lineWidth = 3
        currentPath?.lineCapStyle = .round
        currentPath?.lineJoinStyle = .round
        currentPath?.stroke()
    }

    func clearSignature() {
        currentPath = nil
        setNeedsDisplay()
    }

    func captureSignature() -> UIImage? {
        let renderer = UIGraphicsImageRenderer(bounds: bounds)
        let image = renderer.image { _ in
            UIColor(WISEColor.bgPrimary).setFill()
            UIRectFill(bounds)
            UIColor(WISEColor.wiseGreen).setStroke()
            currentPath?.lineWidth = 3
            currentPath?.stroke()
        }
        return image
    }
}

// MARK: - ServiceTitan & Jobber Integration

struct ServiceTitanJob: Codable {
    let id: String
    let customerId: String
    let customerName: String
    let address: String
    let notes: String
    let status: String
}

struct JobberJob: Codable {
    let id: String
    let customerId: String
    let customerName: String
    let address: String
    let description: String
    let status: String
}

final class ThirdPartyDispatchIntegration {
    static let shared = ThirdPartyDispatchIntegration()

    // ServiceTitan API
    func fetchServiceTitanJobs(businessId: String, apiKey: String) async throws -> [ServiceTitanJob] {
        guard let url = URL(string: "https://api.servicetitan.com/v2/jm/jobs") else { throw APIError.badURL }
        var request = URLRequest(url: url)
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let data = try await URLSession.shared.data(for: request).0
        return try JSONDecoder().decode([ServiceTitanJob].self, from: data)
    }

    func updateServiceTitanJob(_ jobId: String, status: String, notes: String, apiKey: String) async throws {
        guard let url = URL(string: "https://api.servicetitan.com/v2/jm/jobs/\(jobId)") else { throw APIError.badURL }
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["status": status, "notes": notes])

        _ = try await URLSession.shared.data(for: request)
    }

    // Jobber API
    func fetchJobberJobs(businessId: String, apiKey: String) async throws -> [JobberJob] {
        guard let url = URL(string: "https://api.getjobber.com/graphql") else { throw APIError.badURL }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let query = """
        {
          jobs(first: 50, filter: { status: ASSIGNED }) {
            edges {
              node {
                id
                title
                clientName
                jobAddress { address }
                description
                status
              }
            }
          }
        }
        """
        request.httpBody = try JSONEncoder().encode(["query": query])

        let data = try await URLSession.shared.data(for: request).0
        // Parse GraphQL response
        return []
    }
}

// MARK: - Document Generator (Job Report)

final class DocumentGenerator {
    static func generateJobReport(
        jobId: String,
        customerName: String,
        address: String,
        complaint: String,
        readings: [String: Double],
        photos: [UIImage],
        signature: UIImage?,
        notes: String
    ) -> String {
        var pdf = ""
        pdf += "═══════════════════════════════════════════════\n"
        pdf += "       WISE² FIELD TECH SERVICE REPORT\n"
        pdf += "═══════════════════════════════════════════════\n\n"

        pdf += "JOB ID: #\(jobId)\n"
        pdf += "DATE: \(ISO8601DateFormatter().string(from: Date()))\n\n"

        pdf += "CUSTOMER INFORMATION\n"
        pdf += "─────────────────────────────────────────────\n"
        pdf += "Name: \(customerName)\n"
        pdf += "Address: \(address)\n\n"

        pdf += "COMPLAINT\n"
        pdf += "─────────────────────────────────────────────\n"
        pdf += complaint + "\n\n"

        pdf += "MEASUREMENTS CAPTURED\n"
        pdf += "─────────────────────────────────────────────\n"
        for (key, value) in readings.sorted(by: { $0.key < $1.key }) {
            pdf += "\(key): \(String(format: "%.2f", value))\n"
        }
        pdf += "\n"

        pdf += "SERVICE NOTES\n"
        pdf += "─────────────────────────────────────────────\n"
        pdf += notes + "\n\n"

        pdf += "PHOTOS ATTACHED: \(photos.count) image(s)\n"
        if signature != nil {
            pdf += "✓ Customer signature captured\n"
        }

        pdf += "\n═══════════════════════════════════════════════\n"
        pdf += "Generated by WISE² Field Tech Copilot\n"

        return pdf
    }

    static func exportAsText(_ report: String) -> URL? {
        let filename = "fieldtech_report_\(ISO8601DateFormatter().string(from: Date()).prefix(10)).txt"
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
        let docDir = paths[0]
        let fileURL = docDir.appendingPathComponent(filename)

        do {
            try report.write(to: fileURL, atomically: true, encoding: .utf8)
            return fileURL
        } catch {
            return nil
        }
    }
}

// MARK: - AR Distance Measurement (Measure-Inspired)

class ARMeasurementManager: NSObject, ObservableObject {
    @Published var isARSupported = ARWorldTrackingConfiguration.isSupported
    @Published var measurements: [String] = []
    @Published var lastMeasurement = "0.00 m"

    func measureDistance(_ distance: Float) {
        let meters = distance
        lastMeasurement = String(format: "%.2f m", meters)
        measurements.append("Ductwork: \(lastMeasurement)")
    }
}

struct ARMeasurementView: UIViewControllerRepresentable {
    @ObservedObject var manager = ARMeasurementManager()

    func makeUIViewController(context: Context) -> ARViewController {
        return ARViewController(manager: manager)
    }

    func updateUIViewController(_ uiViewController: ARViewController, context: Context) {}
}

class ARViewController: UIViewController, ARSessionDelegate {
    var arSession = ARSession()
    var manager: ARMeasurementManager

    init(manager: ARMeasurementManager) {
        self.manager = manager
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(WISEColor.bgPrimary)

        let label = UILabel()
        label.text = "AR Distance Measurement\nTap to measure ductwork & equipment"
        label.textColor = UIColor(WISEColor.textPrimary)
        label.textAlignment = .center
        label.numberOfLines = 0
        label.font = UIFont.systemFont(ofSize: 18)
        view.addSubview(label)
        label.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            label.widthAnchor.constraint(equalToConstant: 300)
        ])

        let config = ARWorldTrackingConfiguration()
        if ARWorldTrackingConfiguration.isSupported {
            arSession.run(config)
        }
    }
}

// MARK: - Screenshot Markup Tool (Grab-Inspired)

struct MarkupCanvas: UIViewRepresentable {
    @Binding var canvas: PKCanvasView

    func makeUIView(context: Context) -> PKCanvasView {
        canvas.drawing = PKDrawing()
        canvas.tool = PKInkingTool(.pen, color: UIColor(WISEColor.wiseGreen), width: 2)
        return canvas
    }

    func updateUIView(_ uiView: PKCanvasView, context: Context) {}
}

struct ScreenshotMarkupView: View {
    @State private var screenshot: UIImage?
    @State private var canvas = PKCanvasView()
    @State private var showingMarkupTools = false
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()

            VStack(spacing: WISESpacing.lg) {
                // Header
                HStack {
                    Text("MARK DIAGNOSTIC").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                    Spacer()
                    Button("Done") { dismiss() }.font(WISETypography.bodyLarge).foregroundColor(WISEColor.wiseGreen)
                }
                .padding(WISESpacing.lg)

                // Markup Canvas
                if let img = screenshot {
                    ZStack {
                        Image(uiImage: img).resizable().scaledToFit()
                        MarkupCanvas(canvas: $canvas)
                            .frame(height: 400)
                    }
                    .background(WISEColor.surfacePrimary)
                    .cornerRadius(WISECornerRadius.lg)
                } else {
                    Text("No screenshot to annotate").font(WISETypography.body).foregroundColor(WISEColor.textMuted)
                }

                // Tool Buttons
                HStack(spacing: WISESpacing.md) {
                    Button(action: { canvas.drawing = PKDrawing() }) {
                        Label("Clear", systemImage: "trash.fill").foregroundColor(WISEColor.faultRed)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(WISESpacing.md)
                    .background(WISEColor.faultRed.opacity(0.1))
                    .cornerRadius(WISECornerRadius.md)

                    Button(action: { shareMarkup() }) {
                        Label("Share", systemImage: "square.and.arrow.up").foregroundColor(WISEColor.wiseGreen)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(WISESpacing.md)
                    .background(WISEColor.wiseGreen.opacity(0.1))
                    .cornerRadius(WISECornerRadius.md)
                }

                Spacer()
            }
            .padding(WISESpacing.lg)
        }
    }

    private func shareMarkup() {
        let image = canvas.drawing.image(from: canvas.bounds, scale: 1.0)
        let vc = UIActivityViewController(activityItems: [image], applicationActivities: nil)
        UIApplication.shared.connectedScenes.first { $0 is UIWindowScene }.flatMap { $0 as? UIWindowScene }?.windows.first?.rootViewController?.present(vc, animated: true)
    }
}

// MARK: - Quick Capture Panel (Grab-Style Floating)

struct QuickCapturePanel: View {
    @State private var showingCapture = false
    @State private var capturedImage: UIImage?

    var body: some View {
        VStack(alignment: .trailing, spacing: WISESpacing.md) {
            if showingCapture, let image = capturedImage {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 120, height: 120)
                    .cornerRadius(WISECornerRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: WISECornerRadius.lg)
                            .stroke(WISEColor.wiseGreen, lineWidth: 2)
                    )
            }

            HStack(spacing: WISESpacing.sm) {
                Button(action: { captureScreenshot() }) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 18))
                        .foregroundColor(WISEColor.bgPrimary)
                        .frame(width: 48, height: 48)
                        .background(WISEColor.wiseGreen)
                        .cornerRadius(24)
                }

                Button(action: { showingCapture.toggle() }) {
                    Image(systemName: "arrowshape.up.fill")
                        .font(.system(size: 16))
                        .foregroundColor(WISEColor.bgPrimary)
                        .frame(width: 48, height: 48)
                        .background(WISEColor.electricBlue)
                        .cornerRadius(24)
                }
            }
        }
        .padding(WISESpacing.lg)
    }

    private func captureScreenshot() {
        if let window = UIApplication.shared.connectedScenes.first(where: { $0 is UIWindowScene }).flatMap({ $0 as? UIWindowScene })?.windows.first {
            let renderer = UIGraphicsImageRenderer(bounds: window.bounds)
            capturedImage = renderer.image { ctx in
                window.drawHierarchy(in: window.bounds, afterScreenUpdates: false)
            }
        }
    }
}

// MARK: - Placeholder Tabs

struct EquipmentView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel
    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            VStack {
                Text("EQUIPMENT").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                Text("Fieldpiece Job Link").font(WISETypography.body).foregroundColor(WISEColor.wiseGreen)
                Spacer()
            }.padding(WISESpacing.lg)
        }
    }
}

struct MoreView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel
    @StateObject private var mediaCapture = MediaCapture()
    @StateObject private var voiceRecorder = VoiceRecorder()
    @StateObject private var arManager = ARMeasurementManager()
    @State private var showingCamera = false
    @State private var showingSignature = false
    @State private var showingARMeasurement = false
    @State private var showingScreenshotMarkup = false
    @State private var signatureImage: UIImage?
    @State private var generatedReport = ""
    @State private var showingReport = false

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: WISESpacing.lg) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("DOCUMENTATION").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        Text("CAPTURE & ANNOTATE").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                    }

                    // Measure & Grab Tools
                    VStack(spacing: WISESpacing.md) {
                        Text("ADVANCED TOOLS").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        HStack(spacing: WISESpacing.md) {
                            Button(action: { showingARMeasurement = true }) {
                                VStack(spacing: 8) {
                                    Image(systemName: "ruler.fill").font(.system(size: 28)).foregroundColor(WISEColor.electricBlue)
                                    Text("MEASURE").font(WISETypography.captionSmall).foregroundColor(WISEColor.textPrimary)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(WISESpacing.md)
                                .background(WISEColor.electricBlue.opacity(0.1))
                                .cornerRadius(WISECornerRadius.lg)
                            }

                            Button(action: { showingScreenshotMarkup = true }) {
                                VStack(spacing: 8) {
                                    Image(systemName: "pencil.tip.crop.circle.fill").font(.system(size: 28)).foregroundColor(WISEColor.warningAmber)
                                    Text("MARKUP").font(WISETypography.captionSmall).foregroundColor(WISEColor.textPrimary)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(WISESpacing.md)
                                .background(WISEColor.warningAmber.opacity(0.1))
                                .cornerRadius(WISECornerRadius.lg)
                            }
                        }
                    }

                    // Voice Capture
                    VStack(spacing: WISESpacing.md) {
                        Text("VOICE NOTES").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                        Button(action: { voiceRecorder.isRecording ? voiceRecorder.stopRecording() : voiceRecorder.startRecording() }) {
                            HStack(spacing: WISESpacing.sm) {
                                Image(systemName: voiceRecorder.isRecording ? "stop.circle.fill" : "mic.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(voiceRecorder.isRecording ? WISEColor.faultRed : WISEColor.wiseGreen)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(voiceRecorder.isRecording ? "RECORDING..." : "START VOICE NOTE").font(WISETypography.bodyLarge).foregroundColor(WISEColor.textPrimary)
                                    if !voiceRecorder.recognizedText.isEmpty {
                                        Text(voiceRecorder.recognizedText).font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted).lineLimit(1)
                                    }
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(WISESpacing.lg)
                            .background(voiceRecorder.isRecording ? WISEColor.faultRed.opacity(0.1) : WISEColor.wiseGreen.opacity(0.1))
                            .cornerRadius(WISECornerRadius.lg)
                        }
                    }

                    // Photo Capture
                    VStack(spacing: WISESpacing.md) {
                        Text("CAPTURE EVIDENCE").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)

                        HStack(spacing: WISESpacing.md) {
                            Button(action: { showingCamera = true }) {
                                VStack(spacing: 12) {
                                    Image(systemName: "camera.fill").font(.system(size: 32)).foregroundColor(WISEColor.electricBlue)
                                    Text("TAKE PHOTO").font(WISETypography.captionSmall).foregroundColor(WISEColor.textPrimary)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(WISESpacing.lg)
                                .background(WISEColor.electricBlue.opacity(0.15))
                                .cornerRadius(WISECornerRadius.lg)
                            }

                            Button(action: { showingSignature = true }) {
                                VStack(spacing: 12) {
                                    Image(systemName: "signature").font(.system(size: 32)).foregroundColor(WISEColor.wiseGreen)
                                    Text("SIGN JOB").font(WISETypography.captionSmall).foregroundColor(WISEColor.textPrimary)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(WISESpacing.lg)
                                .background(WISEColor.wiseGreen.opacity(0.15))
                                .cornerRadius(WISECornerRadius.lg)
                            }
                        }

                        if let photo = mediaCapture.selectedPhoto {
                            HStack(spacing: WISESpacing.md) {
                                Image(uiImage: photo).resizable().scaledToFill().frame(height: 140).cornerRadius(WISECornerRadius.md)
                                VStack(alignment: .leading, spacing: 8) {
                                    Label("Photo ✓", systemImage: "checkmark.circle.fill").font(WISETypography.body).foregroundColor(WISEColor.wiseGreen)
                                    if let signature = signatureImage {
                                        Label("Signed ✓", systemImage: "checkmark.circle.fill").font(WISETypography.body).foregroundColor(WISEColor.wiseGreen)
                                    }
                                    if !voiceRecorder.recognizedText.isEmpty {
                                        Label("Noted ✓", systemImage: "checkmark.circle.fill").font(WISETypography.body).foregroundColor(WISEColor.wiseGreen)
                                    }
                                }
                                Spacer()
                            }
                            .padding(WISESpacing.md)
                            .background(WISEColor.surfacePrimary)
                            .cornerRadius(WISECornerRadius.md)
                        }
                    }

                    if !NetworkMonitor.shared.isConnected {
                        HStack(spacing: WISESpacing.sm) {
                            Image(systemName: "wifi.slash").foregroundColor(WISEColor.faultRed)
                            Text("Offline — Syncing when connected").font(WISETypography.body).foregroundColor(WISEColor.faultRed)
                        }
                        .padding(WISESpacing.md)
                        .background(WISEColor.faultRed.opacity(0.1))
                        .cornerRadius(WISECornerRadius.md)
                    }

                    Button(action: { generateReport() }) {
                        HStack {
                            Image(systemName: "doc.text.fill").foregroundColor(WISEColor.metalLight)
                            Text("GENERATE REPORT").font(WISETypography.bodyLarge).foregroundColor(WISEColor.textPrimary)
                            Spacer()
                            Image(systemName: "arrow.right").foregroundColor(WISEColor.wiseGreen)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(WISESpacing.lg)
                        .background(WISEColor.surfacePrimary)
                        .cornerRadius(WISECornerRadius.lg)
                    }

                    Spacer(minLength: WISESpacing.xl)
                }
                .padding(WISESpacing.lg)
            }
        }
        .sheet(isPresented: $showingCamera) {
            CameraCapturePicker(image: $mediaCapture.selectedPhoto)
        }
        .sheet(isPresented: $showingSignature) {
            SignatureCanvasView(signatureImage: $signatureImage)
        }
        .sheet(isPresented: $showingReport) {
            ReportView(report: generatedReport)
        }
        .sheet(isPresented: $showingARMeasurement) {
            VStack {
                HStack {
                    Text("AR MEASUREMENT").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                    Spacer()
                    Button("Close") { showingARMeasurement = false }.font(WISETypography.bodyLarge).foregroundColor(WISEColor.wiseGreen)
                }
                .padding(WISESpacing.lg)

                if arManager.isARSupported {
                    ARMeasurementView(manager: arManager)
                        .ignoresSafeArea()
                } else {
                    VStack {
                        Image(systemName: "arkit.badge.xmark").font(.system(size: 48)).foregroundColor(WISEColor.faultRed)
                        Text("AR not supported on this device").font(WISETypography.body).foregroundColor(WISEColor.textSecondary)
                        Spacer()
                    }
                    .frame(maxHeight: .infinity)
                    .padding(WISESpacing.lg)
                    .background(WISEColor.bgPrimary)
                }
            }
            .background(WISEColor.bgPrimary)
        }
        .sheet(isPresented: $showingScreenshotMarkup) {
            ScreenshotMarkupView()
        }
    }

    private func generateReport() {
        if let job = viewModel.jobs.first {
            let readings = ["Voltage": 120.4, "Current": 7.63, "Pressure Low": 68.4, "Pressure High": 248.7]
            let photos = [mediaCapture.selectedPhoto].compactMap { $0 }
            generatedReport = DocumentGenerator.generateJobReport(
                jobId: job.id,
                customerName: job.customerName,
                address: job.address,
                complaint: job.complaint,
                readings: readings,
                photos: photos,
                signature: signatureImage,
                notes: voiceRecorder.recognizedText
            )
            showingReport = true
        }
    }
}

struct SignatureCanvasView: View {
    @Binding var signatureImage: UIImage?
    @Environment(\.dismiss) var dismiss
    @State private var signaturePad: SignaturePad?

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()

            VStack(spacing: WISESpacing.lg) {
                HStack {
                    Text("CUSTOMER SIGNATURE").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                    Spacer()
                    Button("Done") {
                        signatureImage = signaturePad?.captureSignature()
                        dismiss()
                    }
                    .font(WISETypography.bodyLarge)
                    .foregroundColor(WISEColor.wiseGreen)
                }
                .padding(WISESpacing.lg)

                SignaturePadWrapper(onCapture: { image in
                    signatureImage = image
                })
                .frame(maxHeight: .infinity)

                HStack(spacing: WISESpacing.md) {
                    Button(action: {}) {
                        Text("CLEAR").frame(maxWidth: .infinity).padding(WISESpacing.md).background(WISEColor.faultRed.opacity(0.2)).cornerRadius(WISECornerRadius.lg)
                    }
                    .foregroundColor(WISEColor.faultRed)

                    Button(action: { dismiss() }) {
                        Text("CANCEL").frame(maxWidth: .infinity).padding(WISESpacing.md).background(WISEColor.surfacePrimary).cornerRadius(WISECornerRadius.lg)
                    }
                    .foregroundColor(WISEColor.textPrimary)
                }
                .padding(WISESpacing.lg)
            }
        }
    }
}

struct SignaturePadWrapper: UIViewRepresentable {
    var onCapture: (UIImage) -> Void

    func makeUIView(context: Context) -> SignaturePad {
        let pad = SignaturePad()
        pad.onSignatureCapture = onCapture
        return pad
    }

    func updateUIView(_ uiView: SignaturePad, context: Context) {}
}

struct ReportView: View {
    let report: String
    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()

            VStack(spacing: WISESpacing.lg) {
                HStack {
                    Text("SERVICE REPORT").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
                    Spacer()
                    Button("Share") {
                        if let url = DocumentGenerator.exportAsText(report) {
                            let vc = UIActivityViewController(activityItems: [url], applicationActivities: nil)
                            UIApplication.shared.connectedScenes.first { $0 is UIWindowScene }.flatMap { $0 as? UIWindowScene }?.windows.first?.rootViewController?.present(vc, animated: true)
                        }
                    }
                    .font(WISETypography.bodyLarge)
                    .foregroundColor(WISEColor.wiseGreen)
                }
                .padding(WISESpacing.lg)

                ScrollView {
                    Text(report)
                        .font(.system(.body, design: .monospaced))
                        .foregroundColor(WISEColor.textSecondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(WISESpacing.lg)
                }

                Button(action: { dismiss() }) {
                    Text("DONE").frame(maxWidth: .infinity).padding(WISESpacing.lg).background(WISEColor.wiseGreen.opacity(0.2)).cornerRadius(WISECornerRadius.lg)
                }
                .foregroundColor(WISEColor.wiseGreen)
                .padding(WISESpacing.lg)
            }
        }
    }
}

struct CameraCapturePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.allowsEditing = false
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraCapturePicker

        init(_ parent: CameraCapturePicker) {
            self.parent = parent
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.image = image
            }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

// MARK: - DashboardView

struct DashboardView: View {
    @EnvironmentObject var viewModel: FieldTechViewModel

    var body: some View {
        ZStack {
            WISEColor.bgPrimary.ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: WISESpacing.lg) {
                    headerSection
                    if let firstJob = viewModel.jobs.first {
                        activeJobSection(job: firstJob)
                    }
                    systemStatusSection
                    Spacer(minLength: WISESpacing.xl)
                }
                .padding(WISESpacing.lg)
            }
        }
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "wrench.and.screwdriver.fill")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(WISEColor.wiseGreen)
                Text("WISE²").font(WISETypography.logoTitle).foregroundColor(WISEColor.metalDark)
                Spacer()
                Image(systemName: "bell.badge").foregroundColor(WISEColor.wiseGreen)
            }
            Text("FIELD TECH COPILOT").font(WISETypography.screenTitle).foregroundColor(WISEColor.textPrimary)
            Text("ORGANIZED CHAOS. BETTER RESULTS.").font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted)
        }
    }

    private func activeJobSection(job: FieldTechJob) -> some View {
        VStack(alignment: .leading, spacing: WISESpacing.md) {
            HStack {
                Text("ACTIVE JOB").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
                Spacer()
                Text("#\(job.id)").font(WISETypography.diagnostic).foregroundColor(WISEColor.wiseGreen)
            }
            Text(job.complaint).font(WISETypography.bodyLarge).foregroundColor(WISEColor.textPrimary)
            HStack(spacing: WISESpacing.sm) {
                Label(job.priority.uppercased(), systemImage: "exclamationmark.circle.fill").font(WISETypography.caption).foregroundColor(WISEColor.faultRed)
                Spacer()
                Text("On Site").font(WISETypography.caption).foregroundColor(WISEColor.wiseGreen)
            }
            VStack(alignment: .leading, spacing: 6) {
                Label(job.customerName, systemImage: "person.fill").font(WISETypography.body)
                Label(job.address, systemImage: "mappin.and.ellipse").font(WISETypography.body)
                if let phone = job.customerPhone {
                    Label(phone, systemImage: "phone.fill").font(WISETypography.body)
                }
            }
            .foregroundColor(WISEColor.textSecondary)
        }
        .wisePanelStyle(highlighted: true)
    }

    private var systemStatusSection: some View {
        VStack(alignment: .leading, spacing: WISESpacing.md) {
            Text("SYSTEM STATUS").font(WISETypography.caption).foregroundColor(WISEColor.textSecondary)
            HStack(spacing: WISESpacing.md) {
                gaugeSmall(value: "55°F", title: "SUPPLY AIR", accent: WISEColor.electricBlue)
                gaugeSmall(value: "72°F", title: "RETURN AIR", accent: WISEColor.wiseGreen)
            }
            HStack(spacing: WISESpacing.md) {
                gaugeSmall(value: "R-410A", title: "REFRIGERANT", accent: WISEColor.warningAmber)
                gaugeSmall(value: "COOL", title: "SYSTEM MODE", accent: WISEColor.wiseGreen)
            }
        }
    }

    private func gaugeSmall(value: String, title: String, accent: Color) -> some View {
        VStack(spacing: 8) {
            Text(value).font(WISETypography.measurementSmall).foregroundColor(accent).monospacedDigit()
            Text(title).font(WISETypography.captionSmall).foregroundColor(WISEColor.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(WISESpacing.md)
        .background(WISEColor.surfacePrimary)
        .cornerRadius(WISECornerRadius.md)
    }
}
