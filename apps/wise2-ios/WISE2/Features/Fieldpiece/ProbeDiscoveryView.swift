import SwiftUI

struct ProbeDiscoveryView: View {
  @ObservedObject var fieldpieceService: FieldpieceService
  @State private var showingOnboarding = false

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      SectionLabel(title: "Smart Tools")

      if !fieldpieceService.bleManager.isBluetoothAvailable {
        CommandCard {
          HStack {
            Image(systemName: "exclamationmark.triangle.fill")
              .foregroundColor(.wise2Warning)
            Text("Bluetooth not available on this device")
              .font(.subheadline)
              .foregroundColor(.wise2TextSecondary)
          }
        }
      }

      // Scan Controls
      HStack(spacing: 12) {
        Button(action: {
          if fieldpieceService.bleManager.isScanning {
            fieldpieceService.stopScanning()
          } else {
            fieldpieceService.startScanning()
          }
        }) {
          HStack {
            Image(systemName: fieldpieceService.bleManager.isScanning ? "stop.fill" : "radiowaves.left")
            Text(fieldpieceService.bleManager.isScanning ? "Stop Scan" : "Start Scan")
              .font(.subheadline)
          }
          .frame(maxWidth: .infinity)
          .padding(.vertical, 10)
          .background(Color.wise2Primary.opacity(0.2))
          .foregroundColor(.wise2Primary)
          .cornerRadius(8)
        }

        if !fieldpieceService.bleManager.discoveredProbes.isEmpty {
          Button(action: { fieldpieceService.bleManager.discoveredProbes.removeAll() }) {
            Image(systemName: "xmark")
              .font(.subheadline)
              .padding(.vertical, 10)
              .padding(.horizontal, 12)
              .background(Color.wise2TextSecondary.opacity(0.1))
              .foregroundColor(.wise2TextSecondary)
              .cornerRadius(8)
          }
        }
      }

      // Discovered Probes
      if fieldpieceService.bleManager.discoveredProbes.isEmpty {
        CommandCard {
          Text(fieldpieceService.bleManager.isScanning ? "Searching for Fieldpiece tools…" : "Tap 'Start Scan' to find nearby tools")
            .font(.subheadline)
            .foregroundColor(.wise2TextSecondary)
        }
      } else {
        VStack(alignment: .leading, spacing: 10) {
          ForEach(fieldpieceService.bleManager.discoveredProbes) { probe in
            ProbeCard(
              probe: probe,
              isConnected: fieldpieceService.bleManager.connectedProbes.contains(probe.id),
              onConnect: {
                fieldpieceService.bleManager.connect(to: probe)
              },
              onDisconnect: {
                fieldpieceService.bleManager.disconnect(from: probe.id)
              }
            )
          }
        }
      }

      // Recording Status
      if !fieldpieceService.bleManager.connectedProbes.isEmpty {
        VStack(alignment: .leading, spacing: 12) {
          Divider()
            .foregroundColor(.wise2TextSecondary.opacity(0.2))

          HStack {
            Image(systemName: "circle.fill")
              .font(.caption2)
              .foregroundColor(fieldpieceService.isRecording ? .wise2Warning : .wise2TextSecondary)

            Text(fieldpieceService.isRecording ? "Recording measurements" : "Ready to record")
              .font(.subheadline)
              .foregroundColor(.wise2TextPrimary)

            Spacer()

            Button(action: {
              if fieldpieceService.isRecording {
                fieldpieceService.stopRecording()
              } else {
                fieldpieceService.startRecording()
              }
            }) {
              HStack {
                Image(systemName: fieldpieceService.isRecording ? "stop.circle.fill" : "record.circle")
                  .font(.body)
                Text(fieldpieceService.isRecording ? "Stop" : "Record")
                  .font(.subheadline)
              }
              .padding(.vertical, 6)
              .padding(.horizontal, 12)
              .background(fieldpieceService.isRecording ? Color.wise2Warning.opacity(0.2) : Color.wise2Primary.opacity(0.2))
              .foregroundColor(fieldpieceService.isRecording ? .wise2Warning : .wise2Primary)
              .cornerRadius(6)
            }
          }

          if fieldpieceService.isRecording && !fieldpieceService.jobContext.measurements.isEmpty {
            MeasurementsSummary(measurements: fieldpieceService.jobContext.measurements)
          }
        }
      }
    }
  }
}

// MARK: - Probe Card

struct ProbeCard: View {
  let probe: FieldpieceProbe
  let isConnected: Bool
  let onConnect: () -> Void
  let onDisconnect: () -> Void

  var body: some View {
    CommandCard {
      VStack(alignment: .leading, spacing: 12) {
        HStack(alignment: .top) {
          VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 8) {
              Image(systemName: probe.role.icon)
                .font(.subheadline)
                .foregroundColor(.wise2Primary)

              Text(probe.name)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.wise2TextPrimary)
            }

            Text(probe.role.displayName)
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
          }

          Spacer()

          VStack(alignment: .trailing, spacing: 4) {
            HStack(spacing: 4) {
              Image(systemName: "wifi")
                .font(.caption2)
              Text(probe.signalStrength)
                .font(.caption2)
            }
            .foregroundColor(Color(probe.signalColor))

            if isConnected {
              HStack(spacing: 4) {
                Image(systemName: "checkmark.circle.fill")
                  .font(.caption2)
                Text("Connected")
                  .font(.caption2)
              }
              .foregroundColor(.wise2Success)
            }
          }
        }

        if let value = probe.lastValue {
          HStack {
            Text("Last: \(String(format: "%.1f", value))\(probe.role.unit)")
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
            Spacer()
          }
        }

        HStack(spacing: 8) {
          Button(action: isConnected ? onDisconnect : onConnect) {
            HStack {
              Image(systemName: isConnected ? "bolt.slash" : "bolt")
              Text(isConnected ? "Disconnect" : "Connect")
            }
            .font(.caption)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(isConnected ? Color.wise2Warning.opacity(0.2) : Color.wise2Primary.opacity(0.2))
            .foregroundColor(isConnected ? .wise2Warning : .wise2Primary)
            .cornerRadius(6)
          }
        }
      }
    }
  }
}

// MARK: - Measurements Summary

struct MeasurementsSummary: View {
  let measurements: [JobMeasurement]

  var latestByProbe: [String: JobMeasurement] {
    var latest: [String: JobMeasurement] = [:]
    for measurement in measurements {
      let key = measurement.probeId
      if latest[key] == nil || measurement.timestamp > latest[key]!.timestamp {
        latest[key] = measurement
      }
    }
    return latest
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("Live Measurements")
        .font(.caption)
        .foregroundColor(.wise2TextSecondary)

      VStack(alignment: .leading, spacing: 6) {
        ForEach(Array(latestByProbe.values).sorted { $0.role.displayName < $1.role.displayName }) { measurement in
          HStack {
            Text(measurement.role.displayName)
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
            Spacer()
            Text("\(String(format: "%.1f", measurement.value))\(measurement.unit)")
              .font(.caption)
              .fontWeight(.semibold)
              .foregroundColor(.wise2Primary)
          }
        }
      }
      .padding(.vertical, 8)
      .padding(.horizontal, 10)
      .background(Color.wise2Primary.opacity(0.05))
      .cornerRadius(6)
    }
  }
}

#if DEBUG
#Preview {
  ProbeDiscoveryView(fieldpieceService: FieldpieceService())
    .preferredColorScheme(.dark)
    .padding()
}
#endif
