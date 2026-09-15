import Foundation

struct BusinessScope {
  static let options = ["ALL BUSINESSES", "CRM & Pipeline", "Operations", "Finance"]
  static let scopeCaption = "Business context scope"

  static func hermesMode(for scope: String) -> String {
    switch scope {
    case "CRM & Pipeline": return "sales"
    case "Operations": return "ops"
    case "Finance": return "finance"
    default: return "all"
    }
  }
}
