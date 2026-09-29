import Foundation
import SQLite3

actor LocalDatabaseManager {
    static let shared = LocalDatabaseManager()

    private var db: OpaquePointer?
    private let dbPath: String

    init() {
        let fileManager = FileManager.default
        let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
        dbPath = documentsPath.appendingPathComponent("rayban_wearables.db").path
        openDatabase()
    }

    private func openDatabase() {
        if sqlite3_open(dbPath, &db) == SQLITE_OK {
            createTables()
        }
    }

    private func createTables() {
        let createCapturesTable = """
        CREATE TABLE IF NOT EXISTS captures (
            id TEXT PRIMARY KEY,
            deviceId TEXT NOT NULL,
            type TEXT NOT NULL,
            data BLOB,
            status TEXT DEFAULT 'PENDING',
            syncedAt TIMESTAMP,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT
        )
        """

        let createDevicesTable = """
        CREATE TABLE IF NOT EXISTS devices (
            id TEXT PRIMARY KEY,
            name TEXT,
            status TEXT,
            battery REAL,
            lastSeen TIMESTAMP,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """

        let createSyncQueueTable = """
        CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            captureId TEXT UNIQUE,
            operation TEXT,
            retryCount INTEGER DEFAULT 0,
            maxRetries INTEGER DEFAULT 3,
            nextRetry TIMESTAMP,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """

        let createAnalyticsTable = """
        CREATE TABLE IF NOT EXISTS analytics (
            id TEXT PRIMARY KEY,
            deviceId TEXT NOT NULL,
            metric TEXT NOT NULL,
            value REAL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """

        for sql in [createCapturesTable, createDevicesTable, createSyncQueueTable, createAnalyticsTable] {
            sqlite3_exec(db, sql, nil, nil, nil)
        }
    }

    // Captures
    func addCapture(id: String, deviceId: String, type: String, data: Data?, notes: String = "") async {
        let sql = """
        INSERT INTO captures (id, deviceId, type, data, notes) VALUES (?, ?, ?, ?, ?)
        """
        var stmt: OpaquePointer?

        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK {
            sqlite3_bind_text(stmt, 1, id, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(stmt, 2, deviceId, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(stmt, 3, type, -1, SQLITE_TRANSIENT)

            if let data = data {
                let bytes = [UInt8](data)
                sqlite3_bind_blob(stmt, 4, bytes, Int32(bytes.count), SQLITE_TRANSIENT)
            }

            sqlite3_bind_text(stmt, 5, notes, -1, SQLITE_TRANSIENT)
            sqlite3_step(stmt)
            sqlite3_finalize(stmt)
        }
    }

    func getUnsyncedCaptures() async -> [CaptureRecord] {
        var captures: [CaptureRecord] = []
        let sql = "SELECT id, deviceId, type, status, createdAt, notes FROM captures WHERE status = 'PENDING' LIMIT 50"
        var stmt: OpaquePointer?

        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK {
            while sqlite3_step(stmt) == SQLITE_ROW {
                let id = String(cString: sqlite3_column_text(stmt, 0))
                let deviceId = String(cString: sqlite3_column_text(stmt, 1))
                let type = String(cString: sqlite3_column_text(stmt, 2))
                let status = String(cString: sqlite3_column_text(stmt, 3))
                let createdAt = String(cString: sqlite3_column_text(stmt, 4))
                let notes = String(cString: sqlite3_column_text(stmt, 5))

                captures.append(CaptureRecord(id: id, deviceId: deviceId, type: type, status: status, createdAt: createdAt, notes: notes))
            }
            sqlite3_finalize(stmt)
        }
        return captures
    }

    func updateCaptureStatus(captureId: String, status: String) async {
        let sql = "UPDATE captures SET status = ? WHERE id = ?"
        var stmt: OpaquePointer?

        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK {
            sqlite3_bind_text(stmt, 1, status, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(stmt, 2, captureId, -1, SQLITE_TRANSIENT)
            sqlite3_step(stmt)
            sqlite3_finalize(stmt)
        }
    }

    // Devices
    func registerDevice(id: String, name: String) async {
        let sql = "INSERT OR REPLACE INTO devices (id, name, status) VALUES (?, ?, 'connected')"
        var stmt: OpaquePointer?

        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK {
            sqlite3_bind_text(stmt, 1, id, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(stmt, 2, name, -1, SQLITE_TRANSIENT)
            sqlite3_step(stmt)
            sqlite3_finalize(stmt)
        }
    }

    func getDevices() async -> [DeviceRecord] {
        var devices: [DeviceRecord] = []
        let sql = "SELECT id, name, status, battery FROM devices"
        var stmt: OpaquePointer?

        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK {
            while sqlite3_step(stmt) == SQLITE_ROW {
                let id = String(cString: sqlite3_column_text(stmt, 0))
                let name = String(cString: sqlite3_column_text(stmt, 1))
                let status = String(cString: sqlite3_column_text(stmt, 2))
                let battery = Double(sqlite3_column_double(stmt, 3))

                devices.append(DeviceRecord(id: id, name: name, status: status, battery: battery))
            }
            sqlite3_finalize(stmt)
        }
        return devices
    }

    // Sync Queue
    func addToSyncQueue(captureId: String, operation: String) async {
        let id = UUID().uuidString
        let sql = "INSERT INTO sync_queue (id, captureId, operation) VALUES (?, ?, ?)"
        var stmt: OpaquePointer?

        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK {
            sqlite3_bind_text(stmt, 1, id, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(stmt, 2, captureId, -1, SQLITE_TRANSIENT)
            sqlite3_bind_text(stmt, 3, operation, -1, SQLITE_TRANSIENT)
            sqlite3_step(stmt)
            sqlite3_finalize(stmt)
        }
    }

    func getSyncQueue() async -> [SyncQueueRecord] {
        var queue: [SyncQueueRecord] = []
        let sql = """
        SELECT id, captureId, operation, retryCount FROM sync_queue
        WHERE retryCount < maxRetries
        ORDER BY createdAt ASC LIMIT 10
        """
        var stmt: OpaquePointer?

        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK {
            while sqlite3_step(stmt) == SQLITE_ROW {
                let id = String(cString: sqlite3_column_text(stmt, 0))
                let captureId = String(cString: sqlite3_column_text(stmt, 1))
                let operation = String(cString: sqlite3_column_text(stmt, 2))
                let retryCount = Int(sqlite3_column_int(stmt, 3))

                queue.append(SyncQueueRecord(id: id, captureId: captureId, operation: operation, retryCount: retryCount))
            }
            sqlite3_finalize(stmt)
        }
        return queue
    }

    func removeSyncQueueItem(id: String) async {
        let sql = "DELETE FROM sync_queue WHERE id = ?"
        var stmt: OpaquePointer?

        if sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK {
            sqlite3_bind_text(stmt, 1, id, -1, SQLITE_TRANSIENT)
            sqlite3_step(stmt)
            sqlite3_finalize(stmt)
        }
    }
}

struct CaptureRecord: Codable {
    let id: String
    let deviceId: String
    let type: String
    let status: String
    let createdAt: String
    let notes: String
}

struct DeviceRecord: Codable {
    let id: String
    let name: String
    let status: String
    let battery: Double
}

struct SyncQueueRecord: Codable {
    let id: String
    let captureId: String
    let operation: String
    let retryCount: Int
}
