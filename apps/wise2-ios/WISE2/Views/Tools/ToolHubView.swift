import SwiftUI

struct ToolHubView: View {
  @EnvironmentObject var toolHub: ToolHubStore

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()

      ScrollView {
        VStack(spacing: 18) {
          hero
          scanBar
          liveDiagnostics
          devicesSection
          protocolStatus
        }
        .padding(16)
      }
    }
    .navigationTitle("Tool Hub")
    .navigationBarTitleDisplayMode(.inline)
  }

  private var hero: some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 5) {
          Text("WISE² HVAC")
            .font(.caption.weight(.black))
            .tracking(2)
            .foregroundColor(.wise2ElectricGreen)
          Text("FIELD COMMAND")
            .font(.system(size: 30, weight: .black, design: .rounded))
            .foregroundColor(.white)
          Text("Direct wireless tools • live diagnostics")
            .font(.subheadline)
            .foregroundColor(.wise2TextSecondary)
        }
        Spacer()
        ZStack {
          Circle().fill(Color.wise2ElectricGreen.opacity(0.10)).frame(width: 66, height: 66)
          Circle().stroke(Color.wise2ElectricGreen.opacity(0.45), lineWidth: 1).frame(width: 56, height: 56)
          Image(systemName: "wave.3.right.circle.fill")
            .font(.system(size: 34, weight: .semibold))
            .foregroundColor(.wise2ElectricGreen)
        }
      }

      HStack(spacing: 10) {
        StatusPill(title: "\(toolHub.connectedCount) CONNECTED", icon: "link", active: toolHub.connectedCount > 0)
        StatusPill(title: toolHub.isScanning ? "SCANNING" : "READY", icon: "dot.radiowaves.left.and.right", active: toolHub.isScanning)
      }
    }
    .padding(18)
    .background(
      LinearGradient(
        colors: [Color.wise2SurfaceSecondary, Color.wise2Background],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
    )
    .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.wise2ElectricGreen.opacity(0.22), lineWidth: 1))
    .clipShape(RoundedRectangle(cornerRadius: 20))
  }

  private var scanBar: some View {
    VStack(spacing: 12) {
      HStack(spacing: 10) {
        Circle()
          .fill(toolHub.isScanning ? Color.wise2ElectricGreen : Color.wise2TextMuted)
          .frame(width: 8, height: 8)
          .shadow(color: toolHub.isScanning ? Color.wise2ElectricGreen : .clear, radius: 8)
        Text(toolHub.bluetoothMessage)
          .font(.footnote.weight(.semibold))
          .foregroundColor(.wise2TextSecondary)
        Spacer()
      }

      Button {
        toolHub.isScanning ? toolHub.stopScanning() : toolHub.startScanning()
      } label: {
        HStack {
          Image(systemName: toolHub.isScanning ? "stop.fill" : "antenna.radiowaves.left.and.right")
          Text(toolHub.isScanning ? "STOP SCAN" : "SCAN FIELDPIECE TOOLS")
            .font(.system(size: 14, weight: .black))
          Spacer()
          Image(systemName: "chevron.right")
        }
        .foregroundColor(.black)
        .padding(.horizontal, 16)
        .frame(height: 52)
        .background(Color.wise2ElectricGreen)
        .clipShape(RoundedRectangle(cornerRadius: 14))
      }
    }
    .padding(16)
    .background(Color.wise2Surface)
    .clipShape(RoundedRectangle(cornerRadius: 18))
  }

  private var liveDiagnostics: some View {
    VStack(alignment: .leading, spacing: 12) {
      sectionTitle("LIVE DIAGNOSTICS", subtitle: "Verified measurements only")

      if toolHub.readings.isEmpty {
        HStack(spacing: 14) {
          Image(systemName: "shield.checkered")
            .font(.system(size: 26))
            .foregroundColor(.wise2ElectricGreen)
          VStack(alignment: .leading, spacing: 4) {
            Text("Decoder safety lock active")
              .font(.headline)
              .foregroundColor(.white)
            Text("Connect a tool to capture and validate its protocol. WISE² will never guess a measurement.")
              .font(.caption)
              .foregroundColor(.wise2TextMuted)
          }
          Spacer()
        }
        .padding(16)
        .background(Color.wise2Card)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.wise2BorderMedium))
        .clipShape(RoundedRectangle(cornerRadius: 16))
      } else {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
          ForEach(Array(toolHub.readings.suffix(6).reversed())) { reading in
            LiveReadingCard(reading: reading)
          }
        }
      }
    }
  }

  private var devicesSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      sectionTitle("NEARBY TOOLS", subtitle: "Fieldpiece Job Link + compatible BLE")

      if toolHub.devices.isEmpty {
        VStack(spacing: 10) {
          Image(systemName: "sensor.tag.radiowaves.forward.fill")
            .font(.system(size: 36))
            .foregroundColor(.wise2TextMuted)
          Text("No Fieldpiece tools discovered")
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text("Power on your probes, then start a scan.")
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 30)
        .background(Color.wise2Surface)
        .clipShape(RoundedRectangle(cornerRadius: 18))
      } else {
        ForEach(toolHub.devices) { device in
          ToolDeviceCard(device: device) {
            device.isConnected ? toolHub.disconnect(device) : toolHub.connect(device)
          }
        }
      }
    }
  }

  private var protocolStatus: some View {
    HStack(spacing: 12) {
      Image(systemName: "lock.shield.fill").foregroundColor(.wise2ElectricGreen)
      VStack(alignment: .leading, spacing: 3) {
        Text("PROTOCOL GUARD")
          .font(.caption2.weight(.black)).tracking(1.5).foregroundColor(.wise2ElectricGreen)
        Text("Raw BLE capture is local/debug-only. Unknown packets produce zero HVAC readings.")
          .font(.caption).foregroundColor(.wise2TextMuted)
      }
      Spacer()
    }
    .padding(14)
    .background(Color.wise2ElectricGreen.opacity(0.06))
    .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.wise2ElectricGreen.opacity(0.18)))
    .clipShape(RoundedRectangle(cornerRadius: 14))
  }

  private func sectionTitle(_ title: String, subtitle: String) -> some View {
    HStack(alignment: .firstTextBaseline) {
      Text(title).font(.caption.weight(.black)).tracking(1.5).foregroundColor(.wise2TextPrimary)
      Spacer()
      Text(subtitle).font(.caption2).foregroundColor(.wise2TextMuted)
    }
  }
}

struct ToolDeviceCard: View {
  let device: ToolDevice
  let action: () -> Void

  var body: some View {
    HStack(spacing: 14) {
      ZStack {
        RoundedRectangle(cornerRadius: 14)
          .fill(device.isConnected ? Color.wise2ElectricGreen.opacity(0.12) : Color.wise2SurfaceSecondary)
          .frame(width: 54, height: 54)
        Image(systemName: device.family.symbolName)
          .font(.system(size: 23, weight: .bold))
          .foregroundColor(device.isConnected ? .wise2ElectricGreen : .wise2TextSecondary)
      }

      VStack(alignment: .leading, spacing: 4) {
        Text(device.name).font(.headline).foregroundColor(.white).lineLimit(1)
        Text(device.family.rawValue).font(.caption).foregroundColor(.wise2TextMuted)
        HStack(spacing: 8) {
          Label("\(device.rssi) dBm", systemImage: "wifi")
          Text("•")
          Text(device.role.rawValue)
        }
        .font(.caption2.weight(.semibold))
        .foregroundColor(.wise2TextSecondary)
      }

      Spacer()

      Button(action: action) {
        Text(device.isConnected ? "DROP" : "LINK")
          .font(.caption.weight(.black))
          .foregroundColor(device.isConnected ? .black : .wise2ElectricGreen)
          .padding(.horizontal, 13)
          .padding(.vertical, 9)
          .background(device.isConnected ? Color.wise2ElectricGreen : Color.wise2ElectricGreen.opacity(0.08))
          .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.wise2ElectricGreen.opacity(0.5)))
          .clipShape(RoundedRectangle(cornerRadius: 10))
      }
    }
    .padding(14)
    .background(Color.wise2Card)
    .overlay(RoundedRectangle(cornerRadius: 18).stroke(device.isConnected ? Color.wise2ElectricGreen.opacity(0.28) : Color.wise2BorderSubtle))
    .clipShape(RoundedRectangle(cornerRadius: 18))
  }
}

struct LiveReadingCard: View {
  let reading: ToolReading

  var body: some View {
    VStack(alignment: .leading, spacing: 7) {
      Text(reading.role.rawValue.uppercased())
        .font(.caption2.weight(.black)).tracking(1).foregroundColor(.wise2ElectricGreen)
      HStack(alignment: .firstTextBaseline, spacing: 4) {
        Text(String(format: "%.1f", reading.value))
          .font(.system(size: 28, weight: .black, design: .rounded))
          .monospacedDigit()
          .foregroundColor(.white)
        Text(reading.unit).font(.caption.weight(.bold)).foregroundColor(.wise2TextMuted)
      }
      Text(reading.kind.rawValue.replacingOccurrences(of: "relativeHumidity", with: "humidity").uppercased())
        .font(.caption2).foregroundColor(.wise2TextMuted)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(14)
    .background(Color.wise2Card)
    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.wise2ElectricGreen.opacity(0.16)))
    .clipShape(RoundedRectangle(cornerRadius: 16))
  }
}

private struct StatusPill: View {
  let title: String
  let icon: String
  let active: Bool

  var body: some View {
    Label(title, systemImage: icon)
      .font(.system(size: 10, weight: .black))
      .foregroundColor(active ? .wise2ElectricGreen : .wise2TextSecondary)
      .padding(.horizontal, 10)
      .padding(.vertical, 7)
      .background(active ? Color.wise2ElectricGreen.opacity(0.08) : Color.white.opacity(0.04))
      .clipShape(Capsule())
  }
}
