import SwiftUI

struct SyncQueueView: View {
    @StateObject private var coordinator = SyncCoordinator.shared
    @State private var autoRefresh = true

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Sync Queue")
                            .font(.system(size: 24, weight: .bold))
                        Text("\(coordinator.pendingItems.count) items pending")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    Toggle("Auto-refresh", isOn: $autoRefresh)
                        .labelsHidden()
                }
            }
            .padding(16)
            .background(Color(.systemBackground))
            .border(Color.gray.opacity(0.2), width: 1)

            if coordinator.pendingItems.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.green)

                    Text("All Synced")
                        .font(.system(size: 20, weight: .bold))

                    Text("All captures have been synced to the dashboard")
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(.systemBackground))
            } else {
                ScrollView {
                    VStack(spacing: 8) {
                        ForEach(coordinator.pendingItems, id: \.id) { item in
                            SyncQueueItemRow(item: item, capture: findCapture(item.captureId))
                        }
                    }
                    .padding(16)
                }
            }

            // Footer with sync stats
            VStack(spacing: 0) {
                Divider()

                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Sync Status")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)
                        Text(coordinator.syncStatus)
                            .font(.system(size: 14, weight: .bold))
                    }

                    Spacer()

                    HStack(spacing: 8) {
                        Circle()
                            .fill(coordinator.isOnline ? Color.green : Color.red)
                            .frame(width: 10, height: 10)

                        Text(coordinator.isOnline ? "Online" : "Offline")
                            .font(.system(size: 13, weight: .semibold))
                    }
                }
                .padding(16)
            }
            .background(Color(.systemBackground))
        }
        .onReceive(Timer.publish(every: 5, on: .main, in: .common).autoconnect()) { _ in
            if autoRefresh {
                Task {
                    await coordinator.refreshData()
                }
            }
        }
    }

    private func findCapture(_ captureId: String) -> CaptureRecord? {
        coordinator.recentCaptures.first { $0.id == captureId }
    }
}

struct SyncQueueItemRow: View {
    let item: SyncQueueRecord
    let capture: CaptureRecord?
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 12) {
                // Status indicator
                VStack {
                    Circle()
                        .fill(retryColor())
                        .frame(width: 8, height: 8)
                }
                .frame(width: 24)

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(capture?.type.uppercased() ?? "UNKNOWN")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.secondary)

                        Spacer()

                        Text("Retry: \(item.retryCount)/3")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.secondary)
                    }

                    if let capture = capture, !capture.notes.isEmpty {
                        Text(capture.notes)
                            .font(.system(size: 13))
                            .lineLimit(1)
                            .foregroundColor(.primary)
                    }

                    if let capture = capture {
                        Text(formatDate(capture.createdAt))
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.secondary)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isExpanded.toggle()
                }
            }
            .padding(12)

            if isExpanded {
                Divider()
                    .padding(.horizontal, 12)

                VStack(alignment: .leading, spacing: 8) {
                    DetailRow(label: "Queue ID", value: item.id)
                    DetailRow(label: "Capture ID", value: item.captureId)
                    DetailRow(label: "Operation", value: item.operation)
                    DetailRow(label: "Status", value: "Pending")

                    HStack {
                        Text("Device")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, alignment: .leading)

                        Text(capture?.deviceId ?? "Unknown")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.primary)
                            .lineLimit(1)
                    }

                    ProgressView(value: Double(item.retryCount) / 3.0)
                        .tint(retryProgressColor())
                }
                .padding(12)
                .background(Color(.systemGray6))
            }
        }
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .border(Color.gray.opacity(0.2), width: 1)
    }

    private func retryColor() -> Color {
        switch item.retryCount {
        case 0: return .orange
        case 1: return .orange
        case 2: return .red
        default: return .red
        }
    }

    private func retryProgressColor() -> Color {
        switch item.retryCount {
        case 0: return .orange
        case 1: return .orange
        default: return .red
        }
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }

        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            let timeFormatter = DateFormatter()
            timeFormatter.timeStyle = .short
            return "Today at \(timeFormatter.string(from: date))"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else {
            let dateFormatter = DateFormatter()
            dateFormatter.dateStyle = .short
            return dateFormatter.string(from: date)
        }
    }
}

struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            Text(value)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.primary)
                .lineLimit(2)
                .multilineTextAlignment(.trailing)
        }
    }
}

#Preview {
    SyncQueueView()
}
