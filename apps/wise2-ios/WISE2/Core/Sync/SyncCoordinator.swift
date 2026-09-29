import Foundation

@MainActor
class SyncCoordinator: ObservableObject {
    static let shared = SyncCoordinator()

    @Published var isOnline = true
    @Published var syncStatus = "Ready"
    @Published var pendingItems: [SyncQueueRecord] = []
    @Published var recentCaptures: [CaptureRecord] = []
    @Published var connectedDevices: [DeviceRecord] = []

    private let dbManager = LocalDatabaseManager.shared
    private let wsManager = WebSocketManager.shared
    private let apiClient = APIClient.shared
    private var syncTimer: Timer?
    private var statusCheckTimer: Timer?
    private let reconnectQueue = DispatchQueue(label: "com.wise2.sync")

    init() {
        setupWebSocketHandlers()
        startSyncLoop()
    }

    private func setupWebSocketHandlers() {
        Task {
            await wsManager.onConnectionStatusChanged = { [weak self] isConnected in
                DispatchQueue.main.async {
                    self?.isOnline = isConnected
                    self?.syncStatus = isConnected ? "Connected" : "Offline"
                }
            }

            await wsManager.onMessageReceived = { [weak self] message in
                self?.handleWebSocketMessage(message)
            }
        }
    }

    func connectToSync(wsURL: String, authToken: String) async {
        await wsManager.connect(url: wsURL, token: authToken)
        await apiClient.setAuthToken(authToken)
    }

    func startSyncLoop() {
        syncTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            Task {
                await self?.processSyncQueue()
            }
        }

        statusCheckTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { [weak self] _ in
            Task {
                await self?.checkConnectivity()
            }
        }
    }

    private func processSyncQueue() async {
        let queueItems = await dbManager.getSyncQueue()

        for item in queueItems {
            let success = await syncItem(item)
            if success {
                await dbManager.removeSyncQueueItem(id: item.id)
                await MainActor.run {
                    self.pendingItems.removeAll { $0.id == item.id }
                }
            }
        }

        await MainActor.run {
            self.syncStatus = queueItems.isEmpty ? "Synced" : "Syncing (\(queueItems.count) pending)"
        }
    }

    private func syncItem(_ item: SyncQueueRecord) async -> Bool {
        do {
            if item.operation == "upload_capture" {
                let captures = await dbManager.getUnsyncedCaptures()
                if let capture = captures.first(where: { $0.id == item.captureId }) {
                    _ = try await apiClient.createCapture(
                        deviceId: capture.deviceId,
                        type: capture.type,
                        data: Data()
                    )

                    await dbManager.updateCaptureStatus(captureId: capture.id, status: "SYNCED")

                    await broadcastSync(captureId: item.captureId, status: "SYNCED")
                    return true
                }
            }
            return false
        } catch {
            print("Sync error: \(error)")
            return false
        }
    }

    private func checkConnectivity() async {
        do {
            let health = try await apiClient.health()
            DispatchQueue.main.async {
                self.isOnline = health.status == "ok"
            }
        } catch {
            DispatchQueue.main.async {
                self.isOnline = false
            }
        }
    }

    func addCapture(deviceId: String, type: String, data: Data, notes: String = "") async {
        let captureId = UUID().uuidString

        await dbManager.addCapture(
            id: captureId,
            deviceId: deviceId,
            type: type,
            data: data,
            notes: notes
        )

        await dbManager.addToSyncQueue(
            captureId: captureId,
            operation: "upload_capture"
        )

        await MainActor.run {
            self.recentCaptures.insert(
                CaptureRecord(
                    id: captureId,
                    deviceId: deviceId,
                    type: type,
                    status: "PENDING",
                    createdAt: ISO8601DateFormatter().string(from: Date()),
                    notes: notes
                ),
                at: 0
            )
        }
    }

    func registerDevice(deviceId: String, name: String) async {
        do {
            _ = try await apiClient.registerDevice(deviceId: deviceId, name: name)
            await dbManager.registerDevice(id: deviceId, name: name)

            let devices = await dbManager.getDevices()
            await MainActor.run {
                self.connectedDevices = devices
            }
        } catch {
            print("Device registration error: \(error)")
        }
    }

    func refreshData() async {
        do {
            let dashboard = try await apiClient.getDashboard()
            let devices = try await apiClient.listDevices()

            await MainActor.run {
                self.connectedDevices = devices.map { device in
                    DeviceRecord(
                        id: device.id,
                        name: device.name,
                        status: device.status,
                        battery: device.battery ?? 0
                    )
                }
            }
        } catch {
            print("Data refresh error: \(error)")
        }
    }

    private func broadcastSync(captureId: String, status: String) async {
        let message = SyncNotification(captureId: captureId, status: status)
        await wsManager.sendJSON(message)
    }

    private func handleWebSocketMessage(_ message: String) {
        // Handle incoming WebSocket messages (e.g., approval notifications)
        if let data = message.data(using: .utf8) {
            if let notification = try? JSONDecoder().decode(SyncNotification.self, from: data) {
                Task {
                    await dbManager.updateCaptureStatus(captureId: notification.captureId, status: notification.status)
                }
            }
        }
    }

    deinit {
        syncTimer?.invalidate()
        statusCheckTimer?.invalidate()
    }
}

struct SyncNotification: Codable {
    let captureId: String
    let status: String
    let timestamp: Date = Date()
}
