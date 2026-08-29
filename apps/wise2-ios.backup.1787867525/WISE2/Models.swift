import Foundation

// MARK: - Core Models

struct User: Codable {
    let id: String
    let email: String
    let name: String
    let role: String
}

struct AppSettings: Codable {
    let theme: String
    let notificationsEnabled: Bool
    let offlineModeEnabled: Bool
}

// MARK: - FieldTech Domain

struct Job: Codable, Identifiable {
    let id: String
    let customerId: String
    let customerName: String
    let address: String
    let serviceType: String
    let status: String
    let priority: String
    let assignedTo: String
    let scheduledDate: String
    let estimatedDuration: Int
    let notes: String?
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, customerId, customerName, address, serviceType, status, priority
        case assignedTo, scheduledDate, estimatedDuration, notes, createdAt, updatedAt
    }
}

struct Diagnostic: Codable, Identifiable {
    let id: String
    let jobId: String
    let systemStatus: String
    let temperature: Double
    let pressure: Double
    let efficiency: Double
    let issues: [String]
    let recommendations: [String]
    let timestamp: String
}

// MARK: - Dashboard Domain

struct DashboardMetrics: Codable {
    let totalJobs: Int
    let completedJobs: Int
    let activeJobs: Int
    let systemHealth: SystemHealth
    let recentActivity: [Activity]
    let kpis: [KPI]
}

struct SystemHealth: Codable {
    let status: String
    let services: [ServiceStatus]
    let lastChecked: String
}

struct ServiceStatus: Codable {
    let name: String
    let status: String
    let uptime: Double
    let responseTime: Int
}

struct Activity: Codable, Identifiable {
    let id: String
    let type: String
    let description: String
    let timestamp: String
    let userId: String
    let metadata: [String: String]?
}

struct KPI: Codable {
    let name: String
    let value: Double
    let previousValue: Double
    let trend: String
    let unit: String
}

// MARK: - Automation Domain

struct Automation: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let enabled: Bool
    let triggers: [TriggerConfig]
    let actions: [ActionConfig]
    let createdAt: String
    let updatedAt: String
}

struct TriggerConfig: Codable {
    let type: String
    let config: [String: AnyCodable]
}

struct ActionConfig: Codable {
    let type: String
    let config: [String: AnyCodable]
}

// MARK: - Analytics Domain

struct AnalyticsData: Codable {
    let period: String
    let metrics: [AnalyticMetric]
    let startDate: String
    let endDate: String
}

struct AnalyticMetric: Codable {
    let name: String
    let value: Double
    let trend: Trend
    let dataPoints: [DataPoint]
}

struct Trend: Codable {
    let direction: String
    let percentage: Double
}

struct DataPoint: Codable {
    let date: String
    let value: Double
}

// MARK: - Helper Types

enum AnyCodable: Codable {
    case null
    case bool(Bool)
    case int(Int)
    case double(Double)
    case string(String)
    case array([AnyCodable])
    case object([String: AnyCodable])

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self = .null
        } else if let bool = try? container.decode(Bool.self) {
            self = .bool(bool)
        } else if let int = try? container.decode(Int.self) {
            self = .int(int)
        } else if let double = try? container.decode(Double.self) {
            self = .double(double)
        } else if let string = try? container.decode(String.self) {
            self = .string(string)
        } else if let array = try? container.decode([AnyCodable].self) {
            self = .array(array)
        } else if let object = try? container.decode([String: AnyCodable].self) {
            self = .object(object)
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode AnyCodable")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch self {
        case .null:
            try container.encodeNil()
        case .bool(let bool):
            try container.encode(bool)
        case .int(let int):
            try container.encode(int)
        case .double(let double):
            try container.encode(double)
        case .string(let string):
            try container.encode(string)
        case .array(let array):
            try container.encode(array)
        case .object(let object):
            try container.encode(object)
        }
    }
}
