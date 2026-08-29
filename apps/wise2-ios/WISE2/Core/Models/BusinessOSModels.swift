import Foundation

struct BusinessDashboard: Codable, Equatable {
  let revenueToday: Double
  let revenueMonth: Double
  let hotLeadCount: Int
  let activeJobCount: Int
  let unpaidInvoiceCount: Int
  let criticalAlertCount: Int
}

enum BusinessOSModule: String, CaseIterable, Codable, Identifiable {
  case command, crm, work, ai, phone, clients, cloud, studio, money, academy, trading, settings

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
    case .settings: return "gearshape.fill"
    }
  }
}

struct EmptyBusinessResult: Codable, Equatable {}

struct CommandResult: Codable, Equatable {
  let summary: String
  let module: BusinessOSModule?
}

struct BusinessOperation<Payload: Codable & Equatable>: Codable, Equatable {
  let operationId: String
  let status: String
  let message: String
  let auditEventId: String?
  let result: Payload?
}
