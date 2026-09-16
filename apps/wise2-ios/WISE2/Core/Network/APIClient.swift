import Foundation

actor APIClient {
    static let shared = APIClient()

    private let baseURL: String
    private let session = URLSession(configuration: .default)
    private var authToken: String?

    init() {
        self.baseURL = ProcessInfo.processInfo.environment["API_URL"] ?? "http://localhost:3000"
    }

    func setAuthToken(_ token: String) {
        self.authToken = token
    }

    private func makeRequest<T: Codable>(
        endpoint: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)/api\(endpoint)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    // Device Management
    func registerDevice(deviceId: String, name: String) async throws -> DeviceResponse {
        struct Request: Encodable {
            let deviceId: String
            let name: String
        }

        return try await makeRequest(
            endpoint: "/rayban/devices/register",
            method: "POST",
            body: Request(deviceId: deviceId, name: name)
        )
    }

    func listDevices() async throws -> [DeviceResponse] {
        return try await makeRequest(endpoint: "/rayban/devices")
    }

    func updateDeviceStatus(deviceId: String, status: String, battery: Double?, location: String?) async throws -> DeviceResponse {
        struct Request: Encodable {
            let status: String
            let battery: Double?
            let location: String?
        }

        return try await makeRequest(
            endpoint: "/rayban/devices/\(deviceId)/status",
            method: "POST",
            body: Request(status: status, battery: battery, location: location)
        )
    }

    // Capture Management
    func createCapture(deviceId: String, type: String, data: Data) async throws -> CaptureResponse {
        struct Request: Encodable {
            let deviceId: String
            let type: String
            let data: String
        }

        let base64Data = data.base64EncodedString()
        return try await makeRequest(
            endpoint: "/rayban/captures",
            method: "POST",
            body: Request(deviceId: deviceId, type: type, data: base64Data)
        )
    }

    func listCaptures(deviceId: String?, limit: Int = 50, offset: Int = 0) async throws -> [CaptureResponse] {
        var endpoint = "/rayban/captures?limit=\(limit)&offset=\(offset)"
        if let deviceId = deviceId {
            endpoint += "&deviceId=\(deviceId)"
        }
        return try await makeRequest(endpoint: endpoint)
    }

    func getCapture(captureId: String) async throws -> CaptureResponse {
        return try await makeRequest(endpoint: "/rayban/captures/\(captureId)")
    }

    // Commands
    func sendCommand(deviceId: String, command: String, parameters: [String: String]?) async throws -> CommandResponse {
        struct Request: Encodable {
            let deviceId: String
            let command: String
            let parameters: [String: String]?
        }

        return try await makeRequest(
            endpoint: "/rayban/commands/send",
            method: "POST",
            body: Request(deviceId: deviceId, command: command, parameters: parameters)
        )
    }

    // Analytics
    func recordAnalytics(deviceId: String, metric: String, value: Double) async throws {
        struct Request: Encodable {
            let metric: String
            let value: Double
        }

        let _: EmptyResponse = try await makeRequest(
            endpoint: "/rayban/analytics/\(deviceId)",
            method: "POST",
            body: Request(metric: metric, value: value)
        )
    }

    func getAnalytics(deviceId: String, metric: String?) async throws -> [AnalyticsResponse] {
        var endpoint = "/rayban/analytics/\(deviceId)"
        if let metric = metric {
            endpoint += "?metric=\(metric)"
        }
        return try await makeRequest(endpoint: endpoint)
    }

    // Dashboard
    func getDashboard() async throws -> DashboardResponse {
        return try await makeRequest(endpoint: "/rayban/dashboard")
    }

    // Alerts
    func getAlerts(limit: Int = 10, offset: Int = 0) async throws -> [AlertResponse] {
        return try await makeRequest(endpoint: "/rayban/alerts?limit=\(limit)&offset=\(offset)")
    }

    // Health
    func health() async throws -> HealthResponse {
        return try await makeRequest(endpoint: "/rayban/health")
    }
}

enum APIError: Error {
    case invalidURL
    case invalidResponse
    case decodingError
    case networkError(Error)
}

struct DeviceResponse: Codable {
    let id: String
    let name: String
    let status: String
    let battery: Double?
    let lastSeen: String?
}

struct CaptureResponse: Codable {
    let id: String
    let deviceId: String
    let type: String
    let status: String
    let createdAt: String
    let notes: String?
}

struct CommandResponse: Codable {
    let id: String
    let deviceId: String
    let command: String
    let status: String
}

struct AnalyticsResponse: Codable {
    let id: String
    let deviceId: String
    let metric: String
    let value: Double
    let createdAt: String
}

struct DashboardResponse: Codable {
    let stats: DashboardStats
    let recentAlerts: [AlertResponse]
}

struct DashboardStats: Codable {
    let totalCaptures: Int
    let pendingApprovals: Int
    let activeSessions: Int
    let connectedDevices: Int
}

struct AlertResponse: Codable {
    let id: String
    let title: String
    let message: String
    let severity: String
    let createdAt: String
}

struct HealthResponse: Codable {
    let status: String
    let service: String
    let version: String
}

struct EmptyResponse: Codable {}
