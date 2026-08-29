import Foundation

enum ToolDeviceFamily: String, Codable, CaseIterable {
  case pressureProbe = "JL3PR Pressure"
  case pipeClamp = "JL3PC Pipe Clamp"
  case psychrometer = "JL3RH Psychrometer"
  case manometer = "JL3MN Manometer"
  case manifold = "SMAN Manifold"
  case electrical = "Wireless Electrical"
  case unknown = "Unknown Tool"

  var symbolName: String {
    switch self {
    case .pressureProbe: return "gauge.with.dots.needle.67percent"
    case .pipeClamp: return "thermometer.medium"
    case .psychrometer: return "humidity.fill"
    case .manometer: return "arrow.left.and.right.circle.fill"
    case .manifold: return "dial.medium.fill"
    case .electrical: return "bolt.fill"
    case .unknown: return "questionmark.circle"
    }
  }
}

enum ToolMeasurementKind: String, Codable, CaseIterable {
  case pressure
  case temperature
  case relativeHumidity
  case wetBulb
  case dewPoint
  case differentialPressure
  case voltage
  case current
  case resistance
  case unknown

  var defaultUnit: String {
    switch self {
    case .pressure: return "psig"
    case .temperature, .wetBulb, .dewPoint: return "°F"
    case .relativeHumidity: return "%RH"
    case .differentialPressure: return "inWC"
    case .voltage: return "V"
    case .current: return "A"
    case .resistance: return "Ω"
    case .unknown: return ""
    }
  }
}

enum HVACProbeRole: String, Codable, CaseIterable, Identifiable {
  case unassigned = "Unassigned"
  case suction = "Suction"
  case liquid = "Liquid"
  case supply = "Supply"
  case returnAir = "Return"
  case outdoor = "Outdoor"
  case staticSupply = "Supply Static"
  case staticReturn = "Return Static"

  var id: String { rawValue }
}

struct ToolDevice: Identifiable, Equatable, Codable {
  let id: UUID
  var name: String
  var family: ToolDeviceFamily
  var role: HVACProbeRole
  var rssi: Int
  var isConnected: Bool
  var batteryPercent: Int?

  init(
    id: UUID,
    name: String,
    family: ToolDeviceFamily,
    role: HVACProbeRole = .unassigned,
    rssi: Int = -100,
    isConnected: Bool = false,
    batteryPercent: Int? = nil
  ) {
    self.id = id
    self.name = name
    self.family = family
    self.role = role
    self.rssi = rssi
    self.isConnected = isConnected
    self.batteryPercent = batteryPercent
  }
}

struct ToolReading: Identifiable, Equatable, Codable {
  let id: UUID
  let deviceID: UUID
  let kind: ToolMeasurementKind
  let value: Double
  let unit: String
  let role: HVACProbeRole
  let timestamp: Date

  init(
    id: UUID = UUID(),
    deviceID: UUID,
    kind: ToolMeasurementKind,
    value: Double,
    unit: String? = nil,
    role: HVACProbeRole = .unassigned,
    timestamp: Date = Date()
  ) {
    self.id = id
    self.deviceID = deviceID
    self.kind = kind
    self.value = value
    self.unit = unit ?? kind.defaultUnit
    self.role = role
    self.timestamp = timestamp
  }
}

enum FieldpieceDeviceClassifier {
  static func classify(name: String?) -> ToolDeviceFamily {
    let normalized = (name ?? "").uppercased().replacingOccurrences(of: " ", with: "")
    if normalized.contains("JL3PR") { return .pressureProbe }
    if normalized.contains("JL3PC") { return .pipeClamp }
    if normalized.contains("JL3RH") { return .psychrometer }
    if normalized.contains("JL3MN") { return .manometer }
    if normalized.contains("SMAN") { return .manifold }
    if normalized.contains("SC680") || normalized.contains("SC480") || normalized.contains("FIELDPIECE") && normalized.contains("METER") {
      return .electrical
    }
    return .unknown
  }
}

struct FieldpieceProtocolProfile {
  typealias Decoder = (_ data: Data, _ device: ToolDevice) -> [ToolReading]

  let characteristicUUID: String
  let decoder: Decoder
}

struct FieldpiecePacketDecoder {
  private let profiles: [String: FieldpieceProtocolProfile]

  init(profiles: [FieldpieceProtocolProfile] = []) {
    self.profiles = Dictionary(uniqueKeysWithValues: profiles.map { ($0.characteristicUUID.uppercased(), $0) })
  }

  func decode(data: Data, characteristic: String, device: ToolDevice) -> [ToolReading] {
    guard let profile = profiles[characteristic.uppercased()] else { return [] }
    return profile.decoder(data, device)
  }
}

struct HVACReadingSnapshot {
  private let latest: [String: ToolReading]

  init(readings: [ToolReading]) {
    var result: [String: ToolReading] = [:]
    for reading in readings.sorted(by: { $0.timestamp < $1.timestamp }) {
      result[Self.key(role: reading.role, kind: reading.kind)] = reading
    }
    latest = result
  }

  func reading(role: HVACProbeRole, kind: ToolMeasurementKind) -> ToolReading? {
    latest[Self.key(role: role, kind: kind)]
  }

  private static func key(role: HVACProbeRole, kind: ToolMeasurementKind) -> String {
    "\(role.rawValue)|\(kind.rawValue)"
  }
}

struct BLECaptureRecord: Codable, Equatable {
  let peripheralName: String
  let advertisedServices: [String]
  let serviceUUID: String
  let characteristicUUID: String
  let characteristicProperties: [String]
  let payloadHex: String
  let capturedAt: Date

  init(
    peripheralName: String,
    advertisedServices: [String],
    serviceUUID: String,
    characteristicUUID: String,
    characteristicProperties: [String],
    payload: Data,
    capturedAt: Date = Date()
  ) {
    self.peripheralName = peripheralName
    self.advertisedServices = advertisedServices
    self.serviceUUID = serviceUUID
    self.characteristicUUID = characteristicUUID
    self.characteristicProperties = characteristicProperties
    self.payloadHex = payload.map { String(format: "%02X", $0) }.joined()
    self.capturedAt = capturedAt
  }
}
