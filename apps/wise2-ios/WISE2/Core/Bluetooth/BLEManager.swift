import CoreBluetooth
import Foundation
import Combine

@MainActor
class BLEManager: NSObject, ObservableObject {
  @Published var discoveredProbes: [FieldpieceProbe] = []
  @Published var isScanning: Bool = false
  @Published var isBluetoothAvailable: Bool = false
  @Published var connectedProbes: Set<String> = []
  @Published var lastMeasurements: [String: Double] = [:]

  private var centralManager: CBCentralManager?
  private var connectedPeripherals: [String: CBPeripheral] = [:]

  override init() {
    super.init()
    let manager = CBCentralManager(delegate: self, queue: .main)
    self.centralManager = manager
    self.isBluetoothAvailable = manager.state == .poweredOn
  }

  // MARK: - Scanning

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

  // MARK: - Connection

  func connect(to probe: FieldpieceProbe) {
    guard let manager = centralManager else { return }

    // Find the peripheral from our discovered list
    if let peripheral = connectedPeripherals[probe.id] {
      manager.connect(peripheral)
      print("🔗 Connecting to \(probe.name)…")
    }
  }

  func disconnect(from probeId: String) {
    guard let manager = centralManager, let peripheral = connectedPeripherals[probeId] else { return }
    manager.cancelPeripheralConnection(peripheral)
    connectedProbes.remove(probeId)
    print("❌ Disconnected from probe \(probeId)")
  }

  // MARK: - Identification

  private func identifyFieldpieceRole(_ name: String) -> FieldpieceToolRole {
    let upper = name.uppercased()

    // Pressure probes (JL3PR)
    if upper.contains("JL3PR") || upper.contains("PRESS") {
      if upper.contains("HIGH") || upper.contains("RED") || upper.contains("LIQ") {
        return .highSidePressure
      }
      return .lowSidePressure
    }

    // Pipe clamps & temperature probes (JL3PC)
    if upper.contains("JL3PC") || upper.contains("PIPE") || upper.contains("CLAMP") {
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
    if upper.contains("SC4") || upper.contains("SC6") || upper.contains("CLAMP") || upper.contains("AMP") {
      return .multimeter
    }

    // Current clamps (JL3AA)
    if upper.contains("JL3AA") || upper.contains("CURRENT") {
      return .currentClamp
    }

    // Manometers (SM480V)
    if upper.contains("SM4") || upper.contains("SMAN") || upper.contains("MANOMETER") {
      return .staticPressure
    }

    // Liquid probes (JL3PT)
    if upper.contains("JL3PT") || upper.contains("LIQUID") && upper.contains("PROBE") {
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

    // Pressure transducers
    if upper.contains("TRANSDUCER") || upper.contains("XDCR") {
      return .pressureTransducer
    }

    return .unknown
  }

  private func parseManufacturerData(_ advertisementData: [String: Any]) -> Double? {
    if let manufacturerData = advertisementData[CBAdvertisementDataManufacturerDataKey] as? Data {
      if manufacturerData.count >= 2 {
        let value = Int16(littleEndian: manufacturerData.withUnsafeBytes { $0.load(as: Int16.self) })
        return Double(value) / 10.0
      }
    }
    return nil
  }
}

// MARK: - CBCentralManagerDelegate

extension BLEManager: CBCentralManagerDelegate {
  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    DispatchQueue.main.async {
      self.isBluetoothAvailable = central.state == .poweredOn

      switch central.state {
      case .poweredOn:
        print("✅ Bluetooth powered on")
      case .poweredOff:
        print("⚠️ Bluetooth powered off")
        self.stopScanning()
      case .resetting:
        print("🔄 Bluetooth resetting")
      case .unauthorized:
        print("🚫 Bluetooth unauthorized")
      case .unsupported:
        print("❌ Bluetooth unsupported on this device")
      case .unknown:
        print("❓ Bluetooth state unknown")
      @unknown default:
        break
      }
    }
  }

  func centralManager(
    _ central: CBCentralManager,
    didDiscover peripheral: CBPeripheral,
    advertisementData: [String: Any],
    rssi RSSI: NSNumber
  ) {
    let name = peripheral.name ?? "Unknown Device"
    let rssiValue = RSSI.intValue
    let role = identifyFieldpieceRole(name)

    // Only show Fieldpiece devices
    guard role != .unknown || name.contains("Fieldpiece") || name.contains("JL") else {
      return
    }

    let lastValue = parseManufacturerData(advertisementData)

    DispatchQueue.main.async {
      // Check if we already have this probe
      if let index = self.discoveredProbes.firstIndex(where: { $0.id == peripheral.identifier.uuidString }) {
        var probe = self.discoveredProbes[index]
        probe.lastSeen = Date()
        if let value = lastValue {
          probe.lastValue = value
        }
        self.discoveredProbes[index] = probe
      } else {
        let probe = FieldpieceProbe(
          id: peripheral.identifier.uuidString,
          name: name,
          role: role,
          rssi: rssiValue,
          lastValue: lastValue,
          lastSeen: Date()
        )
        self.discoveredProbes.append(probe)
        print("📡 Discovered: \(name) (\(role.displayName))")
      }

      // Store peripheral for later connection
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
    print("❌ Failed to connect: \(error?.localizedDescription ?? "unknown error")")
  }

  func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
    DispatchQueue.main.async {
      self.connectedProbes.remove(peripheral.identifier.uuidString)
      print("⚠️ Disconnected from \(peripheral.name ?? "device")")
    }
  }
}
