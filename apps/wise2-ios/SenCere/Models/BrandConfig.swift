import SwiftUI

enum BrandType: String, CaseIterable {
  case senCere = "SenCere"
  case blakkhail = "blakkhail"
}

struct BrandConfig {
  let id: BrandType
  let name: String
  let primaryColor: Color
  let secondaryColor: Color
  let accentColor: Color
  let logo: String
  let description: String
  let collections: [String]

  static let senCere = BrandConfig(
    id: .senCere,
    name: "SenCere",
    primaryColor: Color(red: 0.839, green: 0.639, blue: 0.192), // Gold
    secondaryColor: Color.black,
    accentColor: Color.white,
    logo: "🎨",
    description: "Creative & Production Studio",
    collections: ["Team Hoodie Order", "Event Shirt 2024", "Company Hats", "Custom Shirts", "Engraved Tumblers"]
  )

  static let blakkhail = BrandConfig(
    id: .blakkhail,
    name: "BLAKK HAIL",
    primaryColor: Color(red: 0.77, green: 0.71, blue: 0.63), // Cream
    secondaryColor: Color(red: 0.10, green: 0.10, blue: 0.10), // Dark
    accentColor: Color(red: 0.83, green: 0.65, blue: 0.46), // Mustard
    logo: "👑",
    description: "Original Fashion | Est. 1996",
    collections: ["Chain Gang", "2Cans RWG", "2Cans BWB", "2Cans RWB", "Alien Alliance", "Photo Shoot"]
  )

  static func config(for brand: BrandType) -> BrandConfig {
    switch brand {
    case .senCere:
      return .senCere
    case .blakkhail:
      return .blakkhail
    }
  }

  static var allBrands: [BrandConfig] {
    return [.senCere, .blakkhail]
  }
}
