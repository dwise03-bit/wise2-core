import Foundation

// MARK: - Tool Roles

enum FieldpieceToolRole: String, Codable, CaseIterable {
  case highSidePressure = "high_side_pressure"
  case lowSidePressure = "low_side_pressure"
  case liquidLineTemp = "liquid_line_temp"
  case suctionLineTemp = "suction_line_temp"
  case supplyPsychrometer = "supply_psychrometer"
  case returnPsychrometer = "return_psychrometer"
  case multimeter = "multimeter"
  case staticPressure = "static_pressure"
  case unknown = "unknown"

  var displayName: String {
    switch self {
    case .highSidePressure: "High Side Pressure"
    case .lowSidePressure: "Low Side Pressure"
    case .liquidLineTemp: "Liquid Line Temp"
    case .suctionLineTemp: "Suction Line Temp"
    case .supplyPsychrometer: "Supply Psychrometer"
    case .returnPsychrometer: "Return Psychrometer"
    case .multimeter: "Multimeter"
    case .staticPressure: "Static Pressure"
    case .unknown: "Unknown Tool"
    }
  }

  var unit: String {
    switch self {
    case .highSidePressure, .lowSidePressure, .staticPressure: "PSIG"
    case .liquidLineTemp, .suctionLineTemp, .supplyPsychrometer, .returnPsychrometer: "°F"
    case .multimeter: "AAC"
    case .unknown: "–"
    }
  }

  var measurementKey: String {
    switch self {
    case .highSidePressure: "liquid_pressure"
    case .lowSidePressure: "suction_pressure"
    case .liquidLineTemp: "liquid_line_temp"
    case .suctionLineTemp: "suction_line_temp"
    case .supplyPsychrometer: "supply_db"
    case .returnPsychrometer: "return_db"
    case .multimeter: "amperage"
    case .staticPressure: "tesp"
    case .unknown: "unknown"
    }
  }

  var icon: String {
    switch self {
    case .highSidePressure, .lowSidePressure: "gauge"
    case .liquidLineTemp, .suctionLineTemp: "thermometer"
    case .supplyPsychrometer, .returnPsychrometer: "humidity"
    case .multimeter: "waveform.circle"
    case .staticPressure: "speedometer"
    case .unknown: "sensor"
    }
  }
}

// MARK: - Discovered Probe

struct FieldpieceProbe: Identifiable, Equatable {
  let id: String // deviceId
  let name: String
  let role: FieldpieceToolRole
  let rssi: Int?
  var isConnected: Bool = false
  var lastValue: Double?
  var lastSeen: Date

  var signalStrength: String {
    guard let rssi else { return "–" }
    if rssi >= -50 { return "Excellent" }
    if rssi >= -60 { return "Good" }
    if rssi >= -70 { return "Fair" }
    return "Poor"
  }

  var signalColor: String {
    guard let rssi else { return "gray" }
    if rssi >= -50 { return "green" }
    if rssi >= -60 { return "yellow" }
    if rssi >= -70 { return "orange" }
    return "red"
  }
}

// MARK: - Job Measurement Context

struct JobMeasurement: Identifiable, Codable {
  let id: String = UUID().uuidString
  let probeId: String
  let role: FieldpieceToolRole
  let value: Double
  let timestamp: Date
  let unit: String

  enum CodingKeys: String, CodingKey {
    case probeId, role, value, timestamp, unit
  }
}

// MARK: - Job Diagnostic Context

struct JobDiagnosticContext: Codable {
  var activeProbes: [String] = []
  var measurements: [JobMeasurement] = []
  var startedAt: Date = Date()
  var notes: String = ""

  mutating func addMeasurement(_ measurement: JobMeasurement) {
    measurements.append(measurement)
    if !activeProbes.contains(measurement.probeId) {
      activeProbes.append(measurement.probeId)
    }
  }
}
