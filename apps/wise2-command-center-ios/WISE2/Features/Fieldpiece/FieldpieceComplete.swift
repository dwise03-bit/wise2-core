import CoreBluetooth
import Foundation
import Combine
import SwiftUI

// MARK: - Models

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

struct FieldpieceProbe: Identifiable, Equatable {
  let id: String
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

struct JobMeasurement: Identifiable, Codable {
  let id: String = UUID().uuidString
  let probeId: String
  let role: FieldpieceToolRole
  let value: Double
  let timestamp: Date
  let unit: String
}

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

// MARK: - BLE Manager

@MainActor
class BLEManager: NSObject, ObservableObject, CBCentralManagerDelegate {
  @Published var discoveredProbes: [FieldpieceProbe] = []
  @Published var isScanning: Bool = false
  @Published var isBluetoothAvailable: Bool = false
  @Published var connectedProbes: Set<String> = []

  private var centralManager: CBCentralManager?
  private var connectedPeripherals: [String: CBPeripheral] = [:]

  override init() {
    super.init()
    let manager = CBCentralManager(delegate: self, queue: .main)
    self.centralManager = manager
    self.isBluetoothAvailable = manager.state == .poweredOn
  }

  func startScanning() {
    guard let manager = centralManager, manager.state == .poweredOn else {
      print("❌ BLE not available")
      return
    }
    discoveredProbes.removeAll()
    isScanning = true
    print("🔍 Starting Fieldpiece BLE scan…")
    manager.scanForPeripherals(withServices: nil, options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
  }

  func stopScanning() {
    centralManager?.stopScan()
    isScanning = false
    print("⏹️ BLE scan stopped")
  }

  func connect(to probe: FieldpieceProbe) {
    guard let manager = centralManager else { return }
    if let peripheral = connectedPeripherals[probe.id] {
      manager.connect(peripheral)
      print("🔗 Connecting to \(probe.name)…")
    }
  }

  func disconnect(from probeId: String) {
    guard let manager = centralManager, let peripheral = connectedPeripherals[probeId] else { return }
    manager.cancelPeripheralConnection(peripheral)
    connectedProbes.remove(probeId)
  }

  private func identifyFieldpieceRole(_ name: String) -> FieldpieceToolRole {
    let upper = name.uppercased()
    if upper.contains("JL3PR") || upper.contains("PRESS") || upper.contains("LOW") {
      return upper.contains("HIGH") || upper.contains("RED") ? .highSidePressure : .lowSidePressure
    }
    if upper.contains("JL3PC") || upper.contains("PIPE") || upper.contains("CLAMP") || upper.contains("TEMP") {
      return upper.contains("LIQ") || upper.contains("HIGH") || upper.contains("RED") ? .liquidLineTemp : .suctionLineTemp
    }
    if upper.contains("JL3RH") || upper.contains("PSYCH") || upper.contains("HUMID") {
      return upper.contains("SUP") || upper.contains("OUT") ? .supplyPsychrometer : .returnPsychrometer
    }
    if upper.contains("SC4") || upper.contains("SC6") || upper.contains("METER") || upper.contains("AMP") {
      return .multimeter
    }
    if upper.contains("SM4") || upper.contains("SMAN") || upper.contains("MANOMETER") {
      return .staticPressure
    }
    return .unknown
  }

  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    DispatchQueue.main.async {
      self.isBluetoothAvailable = central.state == .poweredOn
      switch central.state {
      case .poweredOn: print("✅ Bluetooth powered on")
      case .poweredOff:
        print("⚠️ Bluetooth powered off")
        self.stopScanning()
      case .resetting: print("🔄 Bluetooth resetting")
      case .unauthorized: print("🚫 Bluetooth unauthorized")
      case .unsupported: print("❌ Bluetooth unsupported")
      default: print("❓ Bluetooth state unknown")
      }
    }
  }

  func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String: Any], rssi RSSI: NSNumber) {
    let name = peripheral.name ?? "Unknown Device"
    let rssiValue = RSSI.intValue
    let role = identifyFieldpieceRole(name)

    guard role != .unknown || name.contains("Fieldpiece") || name.contains("JL") else {
      return
    }

    DispatchQueue.main.async {
      if let index = self.discoveredProbes.firstIndex(where: { $0.id == peripheral.identifier.uuidString }) {
        var probe = self.discoveredProbes[index]
        probe.lastSeen = Date()
        self.discoveredProbes[index] = probe
      } else {
        let probe = FieldpieceProbe(
          id: peripheral.identifier.uuidString,
          name: name,
          role: role,
          rssi: rssiValue,
          lastSeen: Date()
        )
        self.discoveredProbes.append(probe)
      }
      self.connectedPeripherals[peripheral.identifier.uuidString] = peripheral
    }
  }

  func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    DispatchQueue.main.async {
      self.connectedProbes.insert(peripheral.identifier.uuidString)
      print("✅ Connected to \(peripheral.name ?? "device")")
    }
  }

  func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
    print("❌ Failed to connect: \(error?.localizedDescription ?? "unknown")")
  }

  func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
    DispatchQueue.main.async {
      self.connectedProbes.remove(peripheral.identifier.uuidString)
    }
  }
}

// MARK: - Fieldpiece Service

@MainActor
class FieldpieceService: ObservableObject {
  @Published var bleManager: BLEManager
  @Published var jobContext: JobDiagnosticContext = JobDiagnosticContext()
  @Published var isRecording: Bool = false

  private var measurementTimer: Timer?

  init() {
    self.bleManager = BLEManager()
  }

  func startScanning() {
    bleManager.startScanning()
  }

  func stopScanning() {
    bleManager.stopScanning()
  }

  func startRecording() {
    isRecording = true
    jobContext = JobDiagnosticContext()
    measurementTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
      Task { @MainActor in
        self?.captureMeasurements()
      }
    }
  }

  func stopRecording() {
    isRecording = false
    measurementTimer?.invalidate()
    measurementTimer = nil
  }

  func captureMeasurements() {
    for probe in bleManager.discoveredProbes where bleManager.connectedProbes.contains(probe.id) {
      let measurement = JobMeasurement(
        probeId: probe.id,
        role: probe.role,
        value: probe.lastValue ?? 0,
        timestamp: Date(),
        unit: probe.role.unit
      )
      jobContext.addMeasurement(measurement)
    }
  }

  func addNote(_ text: String) {
    jobContext.notes = text
  }
}
