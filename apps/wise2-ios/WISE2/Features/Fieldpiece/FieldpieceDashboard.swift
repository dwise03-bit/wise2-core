import SwiftUI

struct FieldpieceDashboard: View {
  @ObservedObject var fieldpieceService: FieldpieceService

  var connectedProbes: [FieldpieceProbe] {
    fieldpieceService.bleManager.discoveredProbes
      .filter { fieldpieceService.bleManager.connectedProbes.contains($0.id) }
  }

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 16) {
        // Header
        VStack(alignment: .leading, spacing: 8) {
          Text("Fieldpiece Dashboard")
            .font(.title2)
            .fontWeight(.bold)
            .foregroundColor(.wise2TextPrimary)

          HStack(spacing: 16) {
            HStack(spacing: 6) {
              Image(systemName: fieldpieceService.bleManager.isBluetoothAvailable ? "bluetooth" : "bluetooth.slash")
                .font(.caption)
                .foregroundColor(fieldpieceService.bleManager.isBluetoothAvailable ? .wise2Success : .wise2Warning)
              Text(fieldpieceService.bleManager.isBluetoothAvailable ? "Connected" : "Offline")
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            }

            HStack(spacing: 6) {
              Image(systemName: "record.circle.fill")
                .font(.caption)
                .foregroundColor(fieldpieceService.isRecording ? .wise2Warning : .wise2TextSecondary)
              Text(fieldpieceService.isRecording ? "Recording" : "Idle")
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            }

            Spacer()

            Text("\(connectedProbes.count) Active")
              .font(.caption)
              .fontWeight(.semibold)
              .foregroundColor(.wise2Primary)
          }
          .padding(.vertical, 8)
          .padding(.horizontal, 12)
          .background(Color.wise2Primary.opacity(0.05))
          .cornerRadius(8)
        }

        // Live Readings
        if !connectedProbes.isEmpty {
          VStack(alignment: .leading, spacing: 12) {
            Text("Live Readings")
              .font(.subheadline)
              .fontWeight(.semibold)
              .foregroundColor(.wise2TextPrimary)

            VStack(spacing: 8) {
              ForEach(connectedProbes) { probe in
                LiveProbeMetric(probe: probe)
              }
            }
          }
        }

        // Recording Stats
        if fieldpieceService.isRecording && !fieldpieceService.jobContext.measurements.isEmpty {
          VStack(alignment: .leading, spacing: 12) {
            Text("Recording Stats")
              .font(.subheadline)
              .fontWeight(.semibold)
              .foregroundColor(.wise2TextPrimary)

            VStack(alignment: .leading, spacing: 12) {
              HStack {
                VStack(alignment: .leading, spacing: 4) {
                  Text("Measurements")
                    .font(.caption)
                    .foregroundColor(.wise2TextSecondary)
                  Text("\(fieldpieceService.jobContext.measurements.count)")
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(.wise2Primary)
                }

                Spacer()

                VStack(alignment: .leading, spacing: 4) {
                  Text("Duration")
                    .font(.caption)
                    .foregroundColor(.wise2TextSecondary)
                  Text(recordingDuration)
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(.wise2Primary)
                }
              }
              .padding(12)
              .background(Color.wise2Primary.opacity(0.05))
              .cornerRadius(8)

              VStack(alignment: .leading, spacing: 8) {
                ForEach(connectedProbes) { probe in
                  let probeCount = fieldpieceService.jobContext.measurements
                    .filter { $0.probeId == probe.id }.count

                  if probeCount > 0 {
                    HStack {
                      HStack(spacing: 6) {
                        Image(systemName: probe.role.icon)
                          .font(.caption2)
                          .foregroundColor(.wise2Primary)
                        Text(probe.role.displayName)
                          .font(.caption)
                          .foregroundColor(.wise2TextPrimary)
                      }

                      Spacer()

                      Text("\(probeCount)")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.wise2TextSecondary)
                    }
                  }
                }
              }
            }
          }
        }

        // Signal Quality
        if !connectedProbes.isEmpty {
          VStack(alignment: .leading, spacing: 12) {
            Text("Signal Quality")
              .font(.subheadline)
              .fontWeight(.semibold)
              .foregroundColor(.wise2TextPrimary)

            VStack(spacing: 8) {
              ForEach(connectedProbes) { probe in
                SignalQualityRow(probe: probe)
              }
            }
          }
        }

        // No Probes
        if connectedProbes.isEmpty {
          VStack(spacing: 12) {
            Image(systemName: "wifi.exclamationmark")
              .font(.system(size: 32))
              .foregroundColor(.wise2TextSecondary)

            Text("No tools connected")
              .font(.subheadline)
              .fontWeight(.semibold)
              .foregroundColor(.wise2TextPrimary)

            Text("Start scanning to discover Fieldpiece tools")
              .font(.caption)
              .foregroundColor(.wise2TextSecondary)
              .multilineTextAlignment(.center)
          }
          .frame(maxWidth: .infinity)
          .padding(.vertical, 24)
        }

        Spacer()
          .frame(height: 20)
      }
      .padding(16)
    }
  }

  var recordingDuration: String {
    let elapsed = Date().timeIntervalSince(fieldpieceService.jobContext.startedAt)
    let minutes = Int(elapsed) / 60
    let seconds = Int(elapsed) % 60
    return String(format: "%02d:%02d", minutes, seconds)
  }
}

// MARK: - Live Probe Metric Card

struct LiveProbeMetric: View {
  let probe: FieldpieceProbe

  var body: some View {
    CommandCard {
      HStack {
        VStack(alignment: .leading, spacing: 6) {
          HStack(spacing: 8) {
            Image(systemName: probe.role.icon)
              .font(.subheadline)
              .foregroundColor(.wise2Primary)

            VStack(alignment: .leading, spacing: 2) {
              Text(probe.role.displayName)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.wise2TextPrimary)

              Text(probe.name)
                .font(.caption2)
                .foregroundColor(.wise2TextSecondary)
            }
          }

          HStack(spacing: 8) {
            if let value = probe.lastValue {
              Text(String(format: "%.1f", value))
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.wise2Success)

              Text(probe.role.unit)
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            } else {
              Text("–")
                .font(.title3)
                .foregroundColor(.wise2TextSecondary)
            }
          }
        }

        Spacer()

        VStack(alignment: .trailing, spacing: 6) {
          VStack(alignment: .trailing, spacing: 2) {
            Text(probe.signalStrength)
              .font(.caption)
              .fontWeight(.semibold)
              .foregroundColor(colorForSignal(probe.signalColor))

            if let rssi = probe.rssi {
              Text("\(rssi) dBm")
                .font(.caption2)
                .foregroundColor(.wise2TextSecondary)
            }
          }

          Image(systemName: signalIcon(probe.signalStrength))
            .font(.headline)
            .foregroundColor(colorForSignal(probe.signalColor))
        }
      }
    }
  }

  private func colorForSignal(_ signal: String) -> Color {
    switch signal {
    case "green": return .wise2Success
    case "yellow": return Color(red: 1.0, green: 0.8, blue: 0)
    case "orange": return Color(red: 1.0, green: 0.6, blue: 0)
    case "red": return .wise2Warning
    default: return .wise2TextSecondary
    }
  }

  private func signalIcon(_ strength: String) -> String {
    switch strength {
    case "Excellent": return "wifi"
    case "Good": return "wifi"
    case "Fair": return "wifi.slash"
    case "Poor": return "wifi.slash"
    default: return "antenna.radiowaves.left.and.right.slash"
    }
  }
}

// MARK: - Signal Quality Row

struct SignalQualityRow: View {
  let probe: FieldpieceProbe

  var body: some View {
    CommandCard {
      VStack(alignment: .leading, spacing: 8) {
        HStack {
          HStack(spacing: 6) {
            Image(systemName: probe.role.icon)
              .font(.caption2)
              .foregroundColor(.wise2Primary)

            Text(probe.name)
              .font(.caption)
              .fontWeight(.semibold)
              .foregroundColor(.wise2TextPrimary)
          }

          Spacer()

          HStack(spacing: 4) {
            ForEach(0..<4, id: \.self) { index in
              RoundedRectangle(cornerRadius: 2)
                .fill(signalStrengthColor(index))
                .frame(width: 3, height: 8)
            }
          }
        }

        // Progress bar for signal
        if let rssi = probe.rssi {
          GeometryReader { geometry in
            ZStack(alignment: .leading) {
              RoundedRectangle(cornerRadius: 2)
                .fill(Color.wise2TextSecondary.opacity(0.1))

              RoundedRectangle(cornerRadius: 2)
                .fill(signalBarColor)
                .frame(width: signalStrengthProgress * geometry.size.width)
            }
          }
          .frame(height: 4)

          HStack {
            Text("RSSI: \(rssi) dBm")
              .font(.caption2)
              .foregroundColor(.wise2TextSecondary)

            Spacer()

            Text(probe.signalStrength)
              .font(.caption2)
              .fontWeight(.semibold)
              .foregroundColor(colorForSignal)
          }
        }
      }
    }
  }

  private var signalStrengthProgress: Double {
    guard let rssi = probe.rssi else { return 0 }
    // RSSI range: -100 (poor) to -30 (excellent)
    let normalized = Double(rssi + 100) / 70.0
    return max(0, min(1, normalized))
  }

  private var signalBarColor: Color {
    guard let rssi = probe.rssi else { return .wise2TextSecondary }
    if rssi >= -50 { return .wise2Success }
    if rssi >= -60 { return Color(red: 1.0, green: 0.8, blue: 0)  }
    if rssi >= -70 { return Color(red: 1.0, green: 0.6, blue: 0)  }
    return .wise2Warning
  }

  private var colorForSignal: Color {
    switch probe.signalColor {
    case "green": return .wise2Success
    case "yellow": return Color(red: 1.0, green: 0.8, blue: 0)
    case "orange": return Color(red: 1.0, green: 0.6, blue: 0)
    case "red": return .wise2Warning
    default: return .wise2TextSecondary
    }
  }

  private func signalStrengthColor(_ index: Int) -> Color {
    let progress = signalStrengthProgress
    let threshold = Double(index + 1) / 4.0
    return progress >= threshold ? signalBarColor : Color.wise2TextSecondary.opacity(0.2)
  }
}

#Preview {
  FieldpieceDashboard(fieldpieceService: FieldpieceService())
}
