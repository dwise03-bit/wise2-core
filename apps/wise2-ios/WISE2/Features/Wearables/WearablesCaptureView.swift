import SwiftUI

struct WearablesCaptureView: View {
    @StateObject private var coordinator = SyncCoordinator.shared
    @State private var selectedDevice: DeviceRecord?
    @State private var captureNotes = ""
    @State private var showingCamera = false
    @State private var selectedImage: Data?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Ray-Ban Wearables")
                                .font(.system(size: 28, weight: .bold))
                            HStack {
                                Circle()
                                    .fill(coordinator.isOnline ? Color.green : Color.red)
                                    .frame(width: 8, height: 8)
                                Text(coordinator.syncStatus)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.secondary)
                            }
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("\(coordinator.pendingItems.count)")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.orange)
                            Text("Pending Sync")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(16)
                .background(Color(.systemBackground))
                .border(Color.gray.opacity(0.2), width: 1)

                // Content
                ScrollView {
                    VStack(spacing: 16) {
                        // Device Selector
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Connected Devices")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.secondary)

                            if coordinator.connectedDevices.isEmpty {
                                Button(action: { Task { await coordinator.refreshData() } }) {
                                    HStack {
                                        Image(systemName: "exclamationmark.circle")
                                        Text("No devices connected")
                                        Spacer()
                                        Image(systemName: "arrow.clockwise")
                                    }
                                    .padding(12)
                                    .foregroundColor(.blue)
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(8)
                                }
                            } else {
                                VStack(spacing: 8) {
                                    ForEach(coordinator.connectedDevices, id: \.id) { device in
                                        DeviceCard(
                                            device: device,
                                            isSelected: selectedDevice?.id == device.id,
                                            onSelect: { selectedDevice = device }
                                        )
                                    }
                                }
                            }
                        }
                        .padding(16)
                        .background(Color(.systemBackground))
                        .cornerRadius(12)

                        // Capture Section
                        if selectedDevice != nil {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Capture")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.secondary)

                                // Image Preview
                                if let imageData = selectedImage, let uiImage = UIImage(data: imageData) {
                                    Image(uiImage: uiImage)
                                        .resizable()
                                        .scaledToFit()
                                        .frame(height: 200)
                                        .cornerRadius(8)
                                        .overlay(
                                            Button(action: { selectedImage = nil }) {
                                                Image(systemName: "xmark.circle.fill")
                                                    .font(.system(size: 24))
                                                    .foregroundColor(.white)
                                                    .padding(8)
                                                    .background(Color.black.opacity(0.6))
                                                    .cornerRadius(12)
                                            },
                                            alignment: .topTrailing
                                        )
                                } else {
                                    Button(action: { showingCamera = true }) {
                                        VStack(spacing: 12) {
                                            Image(systemName: "camera.fill")
                                                .font(.system(size: 32))
                                            Text("Capture Image")
                                                .font(.system(size: 16, weight: .semibold))
                                            Text("From Ray-Ban Wearable")
                                                .font(.system(size: 12))
                                                .foregroundColor(.secondary)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 180)
                                        .foregroundColor(.blue)
                                        .background(Color.blue.opacity(0.1))
                                        .cornerRadius(8)
                                        .border(Color.blue.opacity(0.3), width: 1)
                                    }
                                }

                                // Notes
                                VStack(alignment: .leading, spacing: 4) {
                                    Label("Notes", systemImage: "pencil")
                                        .font(.system(size: 12, weight: .semibold))
                                        .foregroundColor(.secondary)

                                    TextEditor(text: $captureNotes)
                                        .frame(height: 80)
                                        .padding(8)
                                        .background(Color(.systemGray6))
                                        .cornerRadius(8)
                                }

                                // Submit Button
                                Button(action: submitCapture) {
                                    HStack {
                                        Image(systemName: "arrow.up.circle.fill")
                                        Text("Submit Capture")
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(12)
                                    .foregroundColor(.white)
                                    .background(selectedImage != nil ? Color.blue : Color.gray)
                                    .cornerRadius(8)
                                    .font(.system(size: 16, weight: .semibold))
                                }
                                .disabled(selectedImage == nil)
                            }
                            .padding(16)
                            .background(Color(.systemBackground))
                            .cornerRadius(12)
                        }

                        // Recent Captures
                        if !coordinator.recentCaptures.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Recent Captures")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.secondary)

                                VStack(spacing: 8) {
                                    ForEach(coordinator.recentCaptures.prefix(5), id: \.id) { capture in
                                        CaptureRow(capture: capture)
                                    }
                                }
                            }
                            .padding(16)
                            .background(Color(.systemBackground))
                            .cornerRadius(12)
                        }
                    }
                    .padding(16)
                }
            }
            .navigationDestination(isPresented: .constant(coordinator.pendingItems.count > 0)) {
                SyncQueueView()
            }
            .sheet(isPresented: $showingCamera) {
                ImagePickerView(selectedImage: $selectedImage)
            }
            .task {
                await coordinator.refreshData()
            }
        }
    }

    private func submitCapture() {
        guard let device = selectedDevice, let imageData = selectedImage else { return }

        Task {
            await coordinator.addCapture(
                deviceId: device.id,
                type: "image",
                data: imageData,
                notes: captureNotes
            )

            selectedImage = nil
            captureNotes = ""
        }
    }
}

struct DeviceCard: View {
    let device: DeviceRecord
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 12) {
                Image(systemName: "glasses")
                    .font(.system(size: 20))
                    .foregroundColor(isSelected ? .white : .blue)

                VStack(alignment: .leading, spacing: 2) {
                    Text(device.name)
                        .font(.system(size: 14, weight: .semibold))
                    HStack(spacing: 4) {
                        Circle()
                            .fill(device.status == "connected" ? Color.green : Color.red)
                            .frame(width: 6, height: 6)
                        Text(device.status)
                            .font(.system(size: 12))
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(Int(device.battery))%")
                        .font(.system(size: 14, weight: .semibold))
                    ProgressView(value: device.battery / 100)
                        .frame(width: 60)
                }

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }
            .padding(12)
            .foregroundColor(isSelected ? .white : .primary)
            .background(isSelected ? Color.blue : Color(.systemGray6))
            .cornerRadius(8)
        }
    }
}

struct CaptureRow: View {
    let capture: CaptureRecord

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "photo.fill")
                .foregroundColor(.blue)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(capture.type.uppercased())
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.secondary)

                if !capture.notes.isEmpty {
                    Text(capture.notes)
                        .font(.system(size: 13))
                        .lineLimit(1)
                }

                Text(formatDate(capture.createdAt))
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }

            Spacer()

            HStack(spacing: 4) {
                Circle()
                    .fill(statusColor(capture.status))
                    .frame(width: 8, height: 8)

                Text(capture.status)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.secondary)
            }
        }
        .padding(12)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }

    private func statusColor(_ status: String) -> Color {
        switch status {
        case "PENDING": return .orange
        case "SYNCED": return .green
        case "APPROVED": return .blue
        default: return .gray
        }
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }

        let timeFormatter = DateFormatter()
        timeFormatter.timeStyle = .short
        timeFormatter.dateStyle = .short
        return timeFormatter.string(from: date)
    }
}

#Preview {
    WearablesCaptureView()
}
