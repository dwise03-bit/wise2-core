import Foundation

class APIClient {
    static let shared = APIClient()

    private let baseURL = URL(string: ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "https://api.wise2.net")!
    private let session = URLSession.shared
    private let keychain = KeychainManager()

    private init() {}

    // MARK: - Authentication

    func login(email: String, password: String) async throws -> LoginResponse {
        let endpoint = baseURL.appendingPathComponent("/api/auth/login")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["email": email, "password": password]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await session.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }

        return try JSONDecoder().decode(LoginResponse.self, from: data)
    }

    func getCurrentUser() async throws -> User {
        let endpoint = baseURL.appendingPathComponent("/api/auth/me")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        request.setValue("Bearer \(keychain.getToken() ?? "")", forHTTPHeaderField: "Authorization")

        let (data, response) = try await session.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }

        return try JSONDecoder().decode(User.self, from: data)
    }

    // MARK: - FieldTech

    func fetchJobs() async throws -> [Job] {
        let endpoint = baseURL.appendingPathComponent("/api/fieldtech/jobs")
        var request = URLRequest(url: endpoint)
        addAuthHeader(&request)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode([Job].self, from: data)
    }

    func getJob(id: String) async throws -> Job {
        let endpoint = baseURL.appendingPathComponent("/api/fieldtech/jobs/\(id)")
        var request = URLRequest(url: endpoint)
        addAuthHeader(&request)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(Job.self, from: data)
    }

    func updateJobStatus(jobId: String, status: String) async throws -> Job {
        let endpoint = baseURL.appendingPathComponent("/api/fieldtech/jobs/\(jobId)/status")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "PATCH"
        addAuthHeader(&request)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["status": status]
        request.httpBody = try JSONEncoder().encode(body)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(Job.self, from: data)
    }

    func getDiagnostic(jobId: String) async throws -> Diagnostic {
        let endpoint = baseURL.appendingPathComponent("/api/fieldtech/diagnostics/\(jobId)")
        var request = URLRequest(url: endpoint)
        addAuthHeader(&request)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(Diagnostic.self, from: data)
    }

    // MARK: - Dashboard

    func getDashboardMetrics() async throws -> DashboardMetrics {
        let endpoint = baseURL.appendingPathComponent("/api/dashboard/metrics")
        var request = URLRequest(url: endpoint)
        addAuthHeader(&request)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(DashboardMetrics.self, from: data)
    }

    func getSystemHealth() async throws -> SystemHealth {
        let endpoint = baseURL.appendingPathComponent("/api/dashboard/health")
        var request = URLRequest(url: endpoint)
        addAuthHeader(&request)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(SystemHealth.self, from: data)
    }

    func getRecentActivity() async throws -> [Activity] {
        let endpoint = baseURL.appendingPathComponent("/api/dashboard/activities")
        var request = URLRequest(url: endpoint)
        addAuthHeader(&request)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode([Activity].self, from: data)
    }

    // MARK: - Automation

    func fetchAutomations() async throws -> [Automation] {
        let endpoint = baseURL.appendingPathComponent("/api/automation/workflows")
        var request = URLRequest(url: endpoint)
        addAuthHeader(&request)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode([Automation].self, from: data)
    }

    func executeAutomation(automationId: String) async throws {
        let endpoint = baseURL.appendingPathComponent("/api/automation/workflows/\(automationId)/execute")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        addAuthHeader(&request)

        _ = try await session.data(for: request)
    }

    // MARK: - Analytics

    func getAnalytics(period: String) async throws -> AnalyticsData {
        let endpoint = baseURL.appendingPathComponent("/api/analytics")
            .appendingQueryItem("period", value: period)
        var request = URLRequest(url: endpoint)
        addAuthHeader(&request)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(AnalyticsData.self, from: data)
    }

    // MARK: - Helpers

    private func addAuthHeader(_ request: inout URLRequest) {
        if let token = keychain.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }
}

struct LoginResponse: Codable {
    let token: String
    let user: User
}

extension URL {
    func appendingQueryItem(_ name: String, value: String) -> URL {
        var components = URLComponents(url: self, resolvingAgainstBaseURL: false)
        var queryItems = components?.queryItems ?? []
        queryItems.append(URLQueryItem(name: name, value: value))
        components?.queryItems = queryItems
        return components?.url ?? self
    }
}
