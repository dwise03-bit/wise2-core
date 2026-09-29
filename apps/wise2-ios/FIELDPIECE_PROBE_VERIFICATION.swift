import Foundation

// Verification tests for expanded Fieldpiece probe type identification
// Run: swift FIELDPIECE_PROBE_VERIFICATION.swift

enum FieldpieceToolRole: String {
  case highSidePressure = "high_side_pressure"
  case lowSidePressure = "low_side_pressure"
  case liquidLineTemp = "liquid_line_temp"
  case suctionLineTemp = "suction_line_temp"
  case supplyPsychrometer = "supply_psychrometer"
  case returnPsychrometer = "return_psychrometer"
  case multimeter = "multimeter"
  case staticPressure = "static_pressure"
  case currentClamp = "current_clamp"
  case liquidProbe = "liquid_probe"
  case refrigerantProbe = "refrigerant_probe"
  case wirelessProbe = "wireless_probe"
  case pressureTransducer = "pressure_transducer"
  case unknown = "unknown"

  var unit: String {
    switch self {
    case .highSidePressure, .lowSidePressure, .pressureTransducer: return "PSIG"
    case .staticPressure: return "in. wc"
    case .liquidLineTemp, .suctionLineTemp, .supplyPsychrometer, .returnPsychrometer: return "°F"
    case .multimeter, .currentClamp: return "AAC"
    case .liquidProbe, .refrigerantProbe: return "°F"
    case .wirelessProbe: return "–"
    case .unknown: return "–"
    }
  }
}

func identifyFieldpieceRole(_ name: String) -> FieldpieceToolRole {
  let upper = name.uppercased()

  // Check most specific patterns first

  // Current clamps (JL3AA)
  if upper.contains("JL3AA") || (upper.contains("CURRENT") && upper.contains("CLAMP")) {
    return .currentClamp
  }

  // Pressure transducers (XDCR)
  if upper.contains("TRANSDUCER") || upper.contains("XDCR") {
    return .pressureTransducer
  }

  // Pressure probes (JL3PR)
  if upper.contains("JL3PR") {
    if upper.contains("HIGH") || upper.contains("RED") || upper.contains("LIQ") {
      return .highSidePressure
    }
    return .lowSidePressure
  }

  // Pipe clamps (JL3PC)
  if upper.contains("JL3PC") || upper.contains("PIPE") {
    if upper.contains("LIQ") || upper.contains("HIGH") || upper.contains("RED") {
      return .liquidLineTemp
    }
    return .suctionLineTemp
  }

  // Psychrometers (JL3RH)
  if upper.contains("JL3RH") || upper.contains("PSYCH") || upper.contains("HUMID") {
    if upper.contains("SUP") || upper.contains("OUT") {
      return .supplyPsychrometer
    }
    return .returnPsychrometer
  }

  // Clamp meters (SC480/SC680)
  if upper.contains("SC4") || upper.contains("SC6") || upper.contains("METER") || upper.contains("AMP") {
    return .multimeter
  }

  // Manometers (SM480V)
  if upper.contains("SM4") || upper.contains("SMAN") || upper.contains("MANOMETER") {
    return .staticPressure
  }

  // Liquid probes (JL3PT)
  if upper.contains("JL3PT") || (upper.contains("LIQUID") && upper.contains("PROBE")) {
    return .liquidProbe
  }

  // Refrigerant probes (JL3GR)
  if upper.contains("JL3GR") || upper.contains("REFRIG") {
    return .refrigerantProbe
  }

  // Wireless probes (DL3WB)
  if upper.contains("DL3WB") || upper.contains("WIRELESS") || upper.contains("REMOTE") {
    return .wirelessProbe
  }

  return .unknown
}

// Test cases
struct TestCase {
  let name: String
  let expectedRole: FieldpieceToolRole
  let expectedUnit: String
}

let testCases: [TestCase] = [
  // Existing probe types
  TestCase(name: "JL3PR-HIGH", expectedRole: .highSidePressure, expectedUnit: "PSIG"),
  TestCase(name: "JL3PR-LOW", expectedRole: .lowSidePressure, expectedUnit: "PSIG"),
  TestCase(name: "JL3PC-LIQ", expectedRole: .liquidLineTemp, expectedUnit: "°F"),
  TestCase(name: "JL3PC-SUCT", expectedRole: .suctionLineTemp, expectedUnit: "°F"),
  TestCase(name: "JL3RH-SUP", expectedRole: .supplyPsychrometer, expectedUnit: "°F"),
  TestCase(name: "JL3RH-RET", expectedRole: .returnPsychrometer, expectedUnit: "°F"),
  TestCase(name: "SC480", expectedRole: .multimeter, expectedUnit: "AAC"),
  TestCase(name: "SM480V", expectedRole: .staticPressure, expectedUnit: "in. wc"),

  // NEW probe types
  TestCase(name: "JL3AA-Current-Clamp", expectedRole: .currentClamp, expectedUnit: "AAC"),
  TestCase(name: "JL3PT-Liquid-Probe", expectedRole: .liquidProbe, expectedUnit: "°F"),
  TestCase(name: "JL3GR-Refrigerant", expectedRole: .refrigerantProbe, expectedUnit: "°F"),
  TestCase(name: "DL3WB-Wireless", expectedRole: .wirelessProbe, expectedUnit: "–"),
  TestCase(name: "Pressure-Transducer", expectedRole: .pressureTransducer, expectedUnit: "PSIG"),
  TestCase(name: "XDCR-Pressure", expectedRole: .pressureTransducer, expectedUnit: "PSIG"),

  // Generic names
  TestCase(name: "Current Clamp", expectedRole: .currentClamp, expectedUnit: "AAC"),
  TestCase(name: "Refrigerant Probe", expectedRole: .refrigerantProbe, expectedUnit: "°F"),
  TestCase(name: "Wireless Remote", expectedRole: .wirelessProbe, expectedUnit: "–"),
]

print("Fieldpiece Probe Type Verification\n" + String(repeating: "=", count: 50))

var passed = 0
var failed = 0

for test in testCases {
  let result = identifyFieldpieceRole(test.name)
  let unitMatch = result.unit == test.expectedUnit
  let roleMatch = result == test.expectedRole

  if roleMatch && unitMatch {
    passed += 1
    print("✓ \(test.name)")
    print("  → \(result) (\(result.unit))")
  } else {
    failed += 1
    print("✗ \(test.name)")
    print("  Expected: \(test.expectedRole) (\(test.expectedUnit))")
    print("  Got:      \(result) (\(result.unit))")
  }
}

print("\n" + String(repeating: "=", count: 50))
print("Results: \(passed) passed, \(failed) failed out of \(testCases.count) tests")

if failed == 0 {
  print("✓ All tests passed!")
  exit(0)
} else {
  print("✗ Some tests failed")
  exit(1)
}
