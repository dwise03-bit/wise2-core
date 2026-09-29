import Foundation

actor WebSocketManager: NSObject, URLSessionWebSocketDelegate {
    static let shared = WebSocketManager()

    private var webSocket: URLSessionWebSocket?
    private var isConnected = false
    private let reconnectQueue = DispatchQueue(label: "com.wise2.websocket.reconnect")
    private var reconnectAttempts = 0
    private let maxReconnectAttempts = 10
    private var receiveTask: Task<Void, Never>?

    var onMessageReceived: ((String) -> Void)?
    var onConnectionStatusChanged: ((Bool) -> Void)?

    nonisolated override init() {
        super.init()
    }

    func connect(url: String, token: String) async {
        guard let wsURL = URL(string: url) else { return }

        var request = URLRequest(url: wsURL)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let session = URLSession(configuration: .default, delegate: self, delegateQueue: nil)
        webSocket = session.webSocketTask(with: request)
        webSocket?.resume()

        isConnected = true
        onConnectionStatusChanged?(true)
        reconnectAttempts = 0
        receiveTask = Task { await receiveMessages() }
    }

    func disconnect() async {
        receiveTask?.cancel()
        await webSocket?.cancel(with: .goingAway, reason: nil)
        isConnected = false
        onConnectionStatusChanged?(false)
    }

    func send(message: String) async {
        guard isConnected, let webSocket = webSocket else { return }

        do {
            let message = URLSessionWebSocketTask.Message.string(message)
            try await webSocket.send(message)
        } catch {
            print("WebSocket send error: \(error)")
            await handleConnectionError()
        }
    }

    func sendJSON<T: Encodable>(_ data: T) async {
        do {
            let jsonData = try JSONEncoder().encode(data)
            let jsonString = String(data: jsonData, encoding: .utf8) ?? ""
            await send(message: jsonString)
        } catch {
            print("JSON encode error: \(error)")
        }
    }

    private func receiveMessages() async {
        guard let webSocket = webSocket else { return }

        while !Task.isCancelled {
            do {
                let message = try await webSocket.receive()

                switch message {
                case .string(let text):
                    onMessageReceived?(text)
                case .data(let data):
                    if let text = String(data: data, encoding: .utf8) {
                        onMessageReceived?(text)
                    }
                @unknown default:
                    break
                }
            } catch {
                await handleConnectionError()
                break
            }
        }
    }

    private func handleConnectionError() async {
        isConnected = false
        onConnectionStatusChanged?(false)

        if reconnectAttempts < maxReconnectAttempts {
            reconnectAttempts += 1
            let delay = min(pow(2.0, Double(reconnectAttempts)), 300.0)

            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            // Reconnect logic handled by SyncCoordinator
        }
    }

    nonisolated func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
    }

    nonisolated func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didCloseWith closeCode: URLSessionWebSocketTask.CloseCode, reason: Data?) {
    }
}

struct WebSocketMessage: Codable {
    let type: String
    let payload: AnyCodable?
    let timestamp: Date
}

enum AnyCodable: Codable {
    case null
    case bool(Bool)
    case int(Int)
    case double(Double)
    case string(String)
    case array([AnyCodable])
    case dict([String: AnyCodable])

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self = .null
        } else if let bool = try? container.decode(Bool.self) {
            self = .bool(bool)
        } else if let int = try? container.decode(Int.self) {
            self = .int(int)
        } else if let double = try? container.decode(Double.self) {
            self = .double(double)
        } else if let string = try? container.decode(String.self) {
            self = .string(string)
        } else if let array = try? container.decode([AnyCodable].self) {
            self = .array(array)
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            self = .dict(dict)
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode AnyCodable")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch self {
        case .null:
            try container.encodeNil()
        case .bool(let bool):
            try container.encode(bool)
        case .int(let int):
            try container.encode(int)
        case .double(let double):
            try container.encode(double)
        case .string(let string):
            try container.encode(string)
        case .array(let array):
            try container.encode(array)
        case .dict(let dict):
            try container.encode(dict)
        }
    }
}
