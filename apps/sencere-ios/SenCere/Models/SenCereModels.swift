import Foundation

// MARK: - Domain Models

struct SenCereProject: Identifiable, Codable {
  let id: String
  let name: String
  let description: String
  let status: ProjectStatus
  let progress: Double // 0.0 to 1.0
  let createdDate: Date
  let dueDate: Date?
  let team: [TeamMember]
  let thumbnail: String?

  enum ProjectStatus: String, Codable {
    case planning = "planning"
    case design = "design"
    case production = "production"
    case quality = "quality"
    case complete = "complete"
    case cancelled = "cancelled"
  }
}

struct Order: Identifiable, Codable {
  let id: String
  let projectId: String
  let projectName: String
  let status: OrderStatus
  let quantity: Int
  let dueDate: Date
  let progress: Double
  let thumbnail: String?

  enum OrderStatus: String, Codable {
    case quote = "quote"
    case approved = "approved"
    case inProduction = "in_production"
    case qualityCheck = "quality_check"
    case ready = "ready"
    case completed = "completed"
  }
}

struct Quote: Identifiable, Codable {
  let id: String
  let projectId: String
  let customerId: String
  let customerName: String
  let status: QuoteStatus
  let amount: Double
  let items: [QuoteItem]
  let createdDate: Date
  let expiresDate: Date

  enum QuoteStatus: String, Codable {
    case draft = "draft"
    case sent = "sent"
    case viewed = "viewed"
    case approved = "approved"
    case rejected = "rejected"
  }
}

struct QuoteItem: Identifiable, Codable {
  let id: String
  let description: String
  let quantity: Int
  let unitPrice: Double
}

struct Design: Identifiable, Codable {
  let id: String
  let name: String
  let category: DesignCategory
  let thumbnailUrl: String?
  let createdDate: Date
  let status: DesignStatus

  enum DesignCategory: String, Codable {
    case apparel = "apparel"
    case print = "print"
    case logos = "logos"
    case other = "other"
  }

  enum DesignStatus: String, Codable {
    case draft = "draft"
    case approved = "approved"
    case archived = "archived"
  }
}

struct TeamMember: Identifiable, Codable {
  let id: String
  let name: String
  let email: String
  let avatar: String?
  let role: String
}

struct Message: Identifiable, Codable {
  let id: String
  let senderId: String
  let senderName: String
  let senderAvatar: String?
  let content: String
  let timestamp: Date
  let threadId: String
}

struct MessageThread: Identifiable, Codable {
  let id: String
  let participants: [TeamMember]
  let lastMessage: Message?
  let unreadCount: Int
}

struct ActivityItem: Identifiable, Codable {
  let id: String
  let type: ActivityType
  let title: String
  let description: String
  let timestamp: Date
  let icon: String

  enum ActivityType: String, Codable {
    case newProject = "new_project"
    case orderRequest = "order_request"
    case designApproved = "design_approved"
    case paymentReceived = "payment_received"
    case orderProduction = "order_production"
  }
}

struct SenCereUser: Identifiable, Codable {
  let id: String
  let name: String
  let email: String
  let avatar: String?
  let company: String
  let role: String
  let phone: String?
}
