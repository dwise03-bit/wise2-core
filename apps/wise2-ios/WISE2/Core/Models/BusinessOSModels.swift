import Foundation

// MARK: - Core envelope

struct BusinessDashboard: Codable, Equatable {
  let revenueToday: Double
  let revenueMonth: Double
  let hotLeadCount: Int
  let activeJobCount: Int
  let unpaidInvoiceCount: Int
  let criticalAlertCount: Int
}

struct BusinessOperation<Payload: Codable & Equatable>: Codable, Equatable {
  let operationId: String
  let status: String
  let message: String
  let auditEventId: String?
  let result: Payload?
}

struct EmptyBusinessResult: Codable, Equatable {}

struct CommandResult: Codable, Equatable {
  let summary: String
  let module: BusinessOSModule?
}

// MARK: - Module registry (13 modules including hvac)

enum BusinessOSModule: String, CaseIterable, Codable, Identifiable {
  case command, crm, work, ai, phone, clients, cloud, studio, money, academy, trading, hvac, settings

  var id: String { rawValue }

  var title: String {
    switch self {
    case .command: return "Command"
    case .crm: return "CRM"
    case .work: return "Work"
    case .ai: return "AI Workforce"
    case .phone: return "Phone"
    case .clients: return "Clients"
    case .cloud: return "WISE² Cloud"
    case .studio: return "Studio + Growth"
    case .money: return "Money"
    case .academy: return "Academy"
    case .trading: return "WISE² Trading"
    case .hvac: return "HVAC Field"
    case .settings: return "Settings"
    }
  }

  var systemImage: String {
    switch self {
    case .command: return "command.circle.fill"
    case .crm: return "person.2.fill"
    case .work: return "briefcase.fill"
    case .ai: return "sparkles"
    case .phone: return "phone.fill"
    case .clients: return "building.2.fill"
    case .cloud: return "server.rack"
    case .studio: return "wand.and.stars"
    case .money: return "dollarsign.circle.fill"
    case .academy: return "graduationcap.fill"
    case .trading: return "chart.line.uptrend.xyaxis"
    case .hvac: return "thermometer.medium"
    case .settings: return "gearshape.fill"
    }
  }
}

// MARK: - Capabilities

struct BusinessCapabilities: Codable, Equatable {
  let trading: Bool
  let cloud: Bool
  let hvac: Bool
}

// MARK: - CRM

enum CrmStage: String, CaseIterable, Codable, Identifiable {
  case lead, qualified, proposal, won, lost

  var id: String { rawValue }

  var title: String {
    switch self {
    case .lead: return "Lead"
    case .qualified: return "Qualified"
    case .proposal: return "Proposal"
    case .won: return "Won"
    case .lost: return "Lost"
    }
  }
}

struct BusinessLead: Codable, Equatable, Identifiable {
  let id: String
  let businessName: String
  let contactName: String
  let email: String
  let phone: String?
  let stage: CrmStage
  let estimatedOpportunity: Double
  let claimedBy: String?
  let claimedAt: String?
  let source: String
}

struct BusinessOpportunity: Codable, Equatable, Identifiable {
  let id: String
  let title: String
  let amount: Double
  let stage: CrmStage
}

struct LeadClaimResult: Codable, Equatable {
  let leadId: String
  let claimedBy: String
  let claimedAt: String
  let status: String
}

// MARK: - Clients

struct BusinessCustomer: Codable, Equatable, Identifiable {
  let id: String
  let businessName: String
  let contactName: String
  let mrr: Double
  let status: String
}

// MARK: - Work

struct BusinessProject: Codable, Equatable, Identifiable {
  let id: String
  let title: String
  let status: String
}

struct BusinessJob: Codable, Equatable, Identifiable {
  let id: String
  let title: String
  let status: String
}

// MARK: - AI Workforce

struct AgentJob: Codable, Equatable, Identifiable {
  let id: String
  let summary: String
  let role: String
  let status: String
  let requiresApproval: Bool
}

// MARK: - Comms

enum CommsChannel: String, Codable {
  case sms, email, voice, chat
}

struct BusinessConversation: Codable, Equatable, Identifiable {
  let id: String
  let contactName: String
  let channel: CommsChannel
  let preview: String
  let humanTakeover: Bool
}

// MARK: - Cloud

struct CloudInventory: Codable, Equatable {
  let apps: [String]
  let services: [String]
  let controlBridgeConfigured: Bool
}

struct CloudComponent: Codable, Equatable {
  let name: String
  let status: String
}

struct CloudHealth: Codable, Equatable {
  let status: String
  let components: [CloudComponent]
}

struct CloudOperationResult: Codable, Equatable {
  let operation: String
  let target: String?
}

// MARK: - HVAC

struct HvacJob: Codable, Equatable, Identifiable {
  let id: String
  let customerName: String
  let status: String
  let technician: String?
}

struct HvacDraft: Codable, Equatable, Identifiable {
  let id: String
  let idempotencyKey: String
  let customerId: String?
  let notes: String
  let synced: Bool
  let createdAt: String
}

struct HvacDraftRequest: Codable {
  let idempotencyKey: String
  let customerId: String?
  let notes: String
}

// MARK: - Studio

struct StudioSummary: Codable, Equatable {
  let campaigns: Int
  let attributedLeads: Int
  let attributedRevenue: Double
  let providerAvailable: Bool
}

// MARK: - Finance

struct FinanceSummary: Codable, Equatable {
  let revenueToday: Double
  let revenueMonth: Double
  let unpaidInvoiceCount: Int
  let providerAvailable: Bool
  let message: String?
}
