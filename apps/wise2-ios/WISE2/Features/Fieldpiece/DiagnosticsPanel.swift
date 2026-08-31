import SwiftUI

struct DiagnosticsPanel: View {
  @ObservedObject var fieldpieceService: FieldpieceService
  @State private var showingToolSelector = false
  @State private var diagnosticNotes = ""
  @State private var showingSummary = false

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      SectionLabel(title: "Job Diagnostics")

      // Tools Status
      if fieldpieceService.bleManager.connectedProbes.isEmpty {
        CommandCard {
          VStack(alignment: .leading, spacing: 12) {
            HStack {
              Image(systemName: "info.circle")
                .foregroundColor(.wise2Info)
              Text("Connect Fieldpiece tools to capture measurements")
                .font(.subheadline)
                .foregroundColor(.wise2TextSecondary)
            }

            NavigationLink(destination: ProbeDiscoveryView(fieldpieceService: fieldpieceService)) {
              HStack {
                Image(systemName: "plus.circle")
                Text("Connect Tools")
              }
              .frame(maxWidth: .infinity)
              .padding(.vertical, 10)
              .background(Color.wise2Primary.opacity(0.2))
              .foregroundColor(.wise2Primary)
              .cornerRadius(8)
            }
          }
        }
      } else {
        // Connected Tools Summary
        CommandCard {
          VStack(alignment: .leading, spacing: 12) {
            HStack {
              HStack(spacing: 6) {
                Image(systemName: "sensors")
                  .font(.subheadline)
                Text("Connected Tools")
                  .font(.subheadline)
                  .fontWeight(.semibold)
              }
              .foregroundColor(.wise2Primary)

              Spacer()

              Text("\(fieldpieceService.bleManager.connectedProbes.count) active")
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            }

            VStack(alignment: .leading, spacing: 8) {
              ForEach(Array(fieldpieceService.bleManager.discoveredProbes)
                .filter { fieldpieceService.bleManager.connectedProbes.contains($0.id) }) { probe in
                HStack {
                  Image(systemName: probe.role.icon)
                    .font(.caption2)
                    .foregroundColor(.wise2Primary)
                  Text(probe.role.displayName)
                    .font(.caption)
                    .foregroundColor(.wise2TextPrimary)
                  Spacer()
                  if let value = probe.lastValue {
                    Text("\(String(format: "%.1f", value))\(probe.role.unit)")
                      .font(.caption)
                      .fontWeight(.semibold)
                      .foregroundColor(.wise2Success)
                  }
                }
              }
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 10)
            .background(Color.wise2Primary.opacity(0.05))
            .cornerRadius(6)
          }
        }

        // Recording Controls
        CommandCard {
          VStack(alignment: .leading, spacing: 12) {
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
                  Text(fieldpieceService.isRecording ? "Stop" : "Record")
                }
                .font(.caption)
                .padding(.vertical, 6)
                .padding(.horizontal, 10)
                .background(fieldpieceService.isRecording ? Color.wise2Warning.opacity(0.2) : Color.wise2Primary.opacity(0.2))
                .foregroundColor(fieldpieceService.isRecording ? .wise2Warning : .wise2Primary)
                .cornerRadius(6)
              }
            }

            if fieldpieceService.isRecording {
              Text("Capturing measurements every 2 seconds")
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            }
          }
        }
      }

      // Diagnostic Notes
      CommandCard {
        VStack(alignment: .leading, spacing: 8) {
          Text("Notes")
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundColor(.wise2TextPrimary)

          TextEditor(text: $diagnosticNotes)
            .frame(height: 80)
            .font(.caption)
            .foregroundColor(.wise2TextPrimary)
            .scrollContentBackground(.hidden)
            .background(Color.wise2Primary.opacity(0.05))
            .cornerRadius(6)
            .onChange(of: diagnosticNotes) { newValue in
              fieldpieceService.addNote(newValue)
            }
        }
      }

      // Summary & Save
      if !fieldpieceService.jobContext.measurements.isEmpty {
        CommandCard {
          VStack(alignment: .leading, spacing: 12) {
            HStack {
              Image(systemName: "checkmark.circle.fill")
                .foregroundColor(.wise2Success)
              Text("\(fieldpieceService.jobContext.measurements.count) measurements captured")
                .font(.subheadline)
                .foregroundColor(.wise2TextPrimary)
            }

            Button(action: { showingSummary = true }) {
              HStack {
                Image(systemName: "chart.bar")
                Text("View Summary")
              }
              .frame(maxWidth: .infinity)
              .padding(.vertical, 10)
              .background(Color.wise2Primary.opacity(0.2))
              .foregroundColor(.wise2Primary)
              .cornerRadius(8)
            }
          }
        }
      }
    }
    .sheet(isPresented: $showingSummary) {
      MeasurementSummarySheet(fieldpieceService: fieldpieceService, isPresented: $showingSummary)
    }
  }
}

// MARK: - Measurement Summary Sheet

struct MeasurementSummarySheet: View {
  @ObservedObject var fieldpieceService: FieldpieceService
  @Binding var isPresented: Bool

  var groupedMeasurements: [String: [JobMeasurement]] {
    Dictionary(grouping: fieldpieceService.jobContext.measurements) { $0.probeId }
  }

  var body: some View {
    NavigationStack {
      VStack(alignment: .leading, spacing: 16) {
        List {
          Section("Session") {
            HStack {
              Text("Started")
              Spacer()
              Text(fieldpieceService.jobContext.startedAt.formatted(date: .omitted, time: .standard))
                .foregroundColor(.wise2TextSecondary)
            }

            HStack {
              Text("Duration")
              Spacer()
              Text("\(Int(Date().timeIntervalSince(fieldpieceService.jobContext.startedAt))) seconds")
                .foregroundColor(.wise2TextSecondary)
            }

            HStack {
              Text("Total Measurements")
              Spacer()
              Text("\(fieldpieceService.jobContext.measurements.count)")
                .foregroundColor(.wise2Primary)
                .fontWeight(.semibold)
            }
          }

          Section("By Tool") {
            ForEach(Array(groupedMeasurements.keys).sorted(), id: \.self) { probeId in
              let measurements = groupedMeasurements[probeId] ?? []
              let probe = fieldpieceService.bleManager.discoveredProbes.first { $0.id == probeId }

              VStack(alignment: .leading, spacing: 8) {
                HStack {
                  if let probe {
                    Image(systemName: probe.role.icon)
                      .foregroundColor(.wise2Primary)
                    VStack(alignment: .leading, spacing: 2) {
                      Text(probe.role.displayName)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                      Text("\(measurements.count) readings")
                        .font(.caption)
                        .foregroundColor(.wise2TextSecondary)
                    }
                  }
                  Spacer()
                  if let latest = measurements.last {
                    Text("\(String(format: "%.1f", latest.value))\(latest.unit)")
                      .font(.subheadline)
                      .fontWeight(.semibold)
                      .foregroundColor(.wise2Success)
                  }
                }

                // Mini sparkline of values
                GeometryReader { geometry in
                  Canvas { context in
                    let values = measurements.map { $0.value }
                    guard !values.isEmpty else { return }

                    let minVal = values.min() ?? 0
                    let maxVal = values.max() ?? 1
                    let range = maxVal - minVal
                    let width = geometry.size.width
                    let height = geometry.size.height

                    var path = Path()
                    for (index, value) in values.enumerated() {
                      let x = (width / CGFloat(values.count - 1)) * CGFloat(index)
                      let normalizedValue = range > 0 ? (value - minVal) / range : 0.5
                      let y = height - (normalizedValue * height)

                      if index == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                      } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                      }
                    }

                    context.stroke(path, with: .color(.wise2Primary), lineWidth: 1.5)
                  }
                }
                .frame(height: 40)
              }
              .padding(.vertical, 4)
            }
          }

          if !fieldpieceService.jobContext.notes.isEmpty {
            Section("Notes") {
              Text(fieldpieceService.jobContext.notes)
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            }
          }
        }
        .listStyle(.grouped)
        .scrollContentBackground(.hidden)
        .background(Color.wise2Background)
      }
      .navigationTitle("Measurement Summary")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarTrailing) {
          Button("Done") {
            isPresented = false
          }
        }
      }
    }
    .preferredColorScheme(.dark)
  }
}

#if DEBUG
#Preview {
  DiagnosticsPanel(fieldpieceService: FieldpieceService())
    .preferredColorScheme(.dark)
    .padding()
}
#endif
