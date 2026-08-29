import Foundation
import Combine
import CoreBluetooth

protocol ToolTransport: AnyObject {
  var devicesPublisher: AnyPublisher<[ToolDevice], Never> { get }
  var readingsPublisher: AnyPublisher<[ToolReading], Never> { get }
  var scanningPublisher: AnyPublisher<Bool, Never> { get }
  var statusPublisher: AnyPublisher<String, Never> { get }

  func startScanning()
  func stopScanning()
  func connect(_ device: ToolDevice)
  func disconnect(_ device: ToolDevice)
}

final class FieldpieceBLEManager: NSObject, ToolTransport, ObservableObject {
  @Published private(set) var devices: [ToolDevice] = []
  @Published private(set) var readings: [ToolReading] = []
  @Published private(set) var isScanning = false
  @Published private(set) var status = "Bluetooth starting…"

  var devicesPublisher: AnyPublisher<[ToolDevice], Never> { $devices.eraseToAnyPublisher() }
  var readingsPublisher: AnyPublisher<[ToolReading], Never> { $readings.eraseToAnyPublisher() }
  var scanningPublisher: AnyPublisher<Bool, Never> { $isScanning.eraseToAnyPublisher() }
  var statusPublisher: AnyPublisher<String, Never> { $status.eraseToAnyPublisher() }

  private lazy var central = CBCentralManager(delegate: self, queue: .main)
  private var peripherals: [UUID: CBPeripheral] = [:]
  private var advertisedServices: [UUID: [String]] = [:]
  private let packetDecoder = FieldpiecePacketDecoder()

  override init() {
    super.init()
    _ = central
  }

  func startScanning() {
    guard central.state == .poweredOn else {
      status = bluetoothStatus(for: central.state)
      return
    }
    guard !central.isScanning else { return }
    isScanning = true
    status = "Scanning for Fieldpiece tools…"
    central.scanForPeripherals(withServices: nil, options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
  }

  func stopScanning() {
    central.stopScan()
    isScanning = false
    status = devices.isEmpty ? "Scan stopped" : "\(devices.count) tool\(devices.count == 1 ? "" : "s") nearby"
  }

  func connect(_ device: ToolDevice) {
    guard let peripheral = peripherals[device.id] else { return }
    status = "Connecting to \(device.name)…"
    central.connect(peripheral, options: nil)
  }

  func disconnect(_ device: ToolDevice) {
    guard let peripheral = peripherals[device.id] else { return }
    central.cancelPeripheralConnection(peripheral)
  }

  private func upsert(peripheral: CBPeripheral, name: String, rssi: Int) {
    let family = FieldpieceDeviceClassifier.classify(name: name)
    guard family != .unknown else { return }

    if let index = devices.firstIndex(where: { $0.id == peripheral.identifier }) {
      devices[index].name = name
      devices[index].family = family
      devices[index].rssi = rssi
    } else {
      devices.append(ToolDevice(id: peripheral.identifier, name: name, family: family, rssi: rssi))
    }
  }

  private func setConnection(_ id: UUID, connected: Bool) {
    guard let index = devices.firstIndex(where: { $0.id == id }) else { return }
    devices[index].isConnected = connected
  }

  private func bluetoothStatus(for state: CBManagerState) -> String {
    switch state {
    case .poweredOn: return "Bluetooth ready"
    case .poweredOff: return "Bluetooth is off"
    case .unauthorized: return "Bluetooth permission is required"
    case .unsupported: return "Bluetooth LE is not supported"
    case .resetting: return "Bluetooth is resetting…"
    case .unknown: return "Bluetooth status unknown"
    @unknown default: return "Bluetooth unavailable"
    }
  }
}

extension FieldpieceBLEManager: CBCentralManagerDelegate {
  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    status = bluetoothStatus(for: central.state)
    if central.state != .poweredOn {
      isScanning = false
    }
  }

  func centralManager(
    _ central: CBCentralManager,
    didDiscover peripheral: CBPeripheral,
    advertisementData: [String: Any],
    rssi RSSI: NSNumber
  ) {
    let name = peripheral.name ?? advertisementData[CBAdvertisementDataLocalNameKey] as? String ?? "Unknown BLE Tool"
    let family = FieldpieceDeviceClassifier.classify(name: name)
    guard family != .unknown else { return }

    peripherals[peripheral.identifier] = peripheral
    peripheral.delegate = self
    let services = (advertisementData[CBAdvertisementDataServiceUUIDsKey] as? [CBUUID] ?? []).map(\.uuidString)
    advertisedServices[peripheral.identifier] = services
    upsert(peripheral: peripheral, name: name, rssi: RSSI.intValue)
  }

  func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
    setConnection(peripheral.identifier, connected: true)
    status = "Connected to \(peripheral.name ?? "Fieldpiece tool")"
    peripheral.discoverServices(nil)
  }

  func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
    setConnection(peripheral.identifier, connected: false)
    status = error?.localizedDescription ?? "Connection failed"
  }

  func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
    setConnection(peripheral.identifier, connected: false)
    status = error == nil ? "Tool disconnected" : "Tool connection lost"
  }
}

extension FieldpieceBLEManager: CBPeripheralDelegate {
  func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
    guard error == nil else { return }
    peripheral.services?.forEach { peripheral.discoverCharacteristics(nil, for: $0) }
  }

  func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
    guard error == nil else { return }
    service.characteristics?.forEach { characteristic in
      if characteristic.properties.contains(.notify) || characteristic.properties.contains(.indicate) {
        peripheral.setNotifyValue(true, for: characteristic)
      }
      if characteristic.properties.contains(.read) {
        peripheral.readValue(for: characteristic)
      }
    }
  }

  func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
    guard error == nil, let data = characteristic.value,
          let device = devices.first(where: { $0.id == peripheral.identifier }) else { return }

    // Fail closed: the registry is intentionally empty until a Fieldpiece packet profile is physically verified.
    let decoded = packetDecoder.decode(data: data, characteristic: characteristic.uuid.uuidString, device: device)
    if !decoded.isEmpty {
      readings.append(contentsOf: decoded)
      if readings.count > 500 { readings.removeFirst(readings.count - 500) }
    }

    #if DEBUG
    let properties = characteristic.properties.debugLabels
    let capture = BLECaptureRecord(
      peripheralName: peripheral.name ?? device.name,
      advertisedServices: advertisedServices[peripheral.identifier] ?? [],
      serviceUUID: characteristic.service?.uuid.uuidString ?? "",
      characteristicUUID: characteristic.uuid.uuidString,
      characteristicProperties: properties,
      payload: data
    )
    print("FIELDPIECE_CAPTURE \(capture)")
    #endif
  }
}

private extension CBCharacteristicProperties {
  var debugLabels: [String] {
    var labels: [String] = []
    if contains(.read) { labels.append("read") }
    if contains(.write) { labels.append("write") }
    if contains(.writeWithoutResponse) { labels.append("writeWithoutResponse") }
    if contains(.notify) { labels.append("notify") }
    if contains(.indicate) { labels.append("indicate") }
    return labels
  }
}

@MainActor
final class ToolHubStore: ObservableObject {
  @Published private(set) var devices: [ToolDevice] = []
  @Published private(set) var readings: [ToolReading] = []
  @Published private(set) var isScanning = false
  @Published private(set) var bluetoothMessage = "Bluetooth starting…"

  private let transport: ToolTransport
  private var cancellables = Set<AnyCancellable>()

  init(transport: ToolTransport = FieldpieceBLEManager()) {
    self.transport = transport

    transport.devicesPublisher.receive(on: DispatchQueue.main).sink { [weak self] in self?.devices = $0 }.store(in: &cancellables)
    transport.readingsPublisher.receive(on: DispatchQueue.main).sink { [weak self] in self?.readings = $0 }.store(in: &cancellables)
    transport.scanningPublisher.receive(on: DispatchQueue.main).sink { [weak self] in self?.isScanning = $0 }.store(in: &cancellables)
    transport.statusPublisher.receive(on: DispatchQueue.main).sink { [weak self] in self?.bluetoothMessage = $0 }.store(in: &cancellables)
  }

  var connectedCount: Int { devices.filter(\.isConnected).count }
  var snapshot: HVACReadingSnapshot { HVACReadingSnapshot(readings: readings) }

  func startScanning() { transport.startScanning() }
  func stopScanning() { transport.stopScanning() }
  func connect(_ device: ToolDevice) { transport.connect(device) }
  func disconnect(_ device: ToolDevice) { transport.disconnect(device) }
}
