import Foundation
import Combine

@MainActor
class FieldpieceService: ObservableObject {
  @Published var bleManager: BLEManager
  @Published var jobContext: JobDiagnosticContext = JobDiagnosticContext()
  @Published var isRecording: Bool = false

  private var measurementTimer: Timer?

  init() {
    self.bleManager = BLEManager()
  }

  // MARK: - Scanning

  func startScanning() {
    bleManager.startScanning()
  }

  func stopScanning() {
    bleManager.stopScanning()
  }

  // MARK: - Recording Measurements

  func startRecording() {
    isRecording = true
    jobContext = JobDiagnosticContext()
    print("📊 Started recording measurements")

    // Simulate periodic measurements from connected probes
    measurementTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
      Task { @MainActor in
        self?.captureMeasurements()
      }
    }
  }

  func stopRecording() {
    isRecording = false
    measurementTimer?.invalidate()
    measurementTimer = nil
    print("⏹️ Stopped recording measurements")
  }

  func captureMeasurements() {
    for probe in bleManager.discoveredProbes where bleManager.connectedProbes.contains(probe.id) {
      let measurement = JobMeasurement(
        probeId: probe.id,
        role: probe.role,
        value: probe.lastValue ?? 0,
        timestamp: Date(),
        unit: probe.role.unit
      )
      jobContext.addMeasurement(measurement)
      print("✅ Captured: \(probe.name) = \(measurement.value)\(measurement.unit)")
    }
  }

  func addNote(_ text: String) {
    jobContext.notes = text
  }

  // MARK: - Measurement Summary

  var measurementSummary: [String: String] {
    var summary: [String: String] = [:]

    for probe in bleManager.discoveredProbes {
      if let lastMeasurement = jobContext.measurements.filter({ $0.probeId == probe.id }).last {
        summary[probe.name] = "\(lastMeasurement.value)\(lastMeasurement.unit)"
      }
    }

    return summary
  }

  // MARK: - Save Job with Measurements

  func saveJobWithMeasurements(jobId: String) -> Bool {
    guard !jobContext.measurements.isEmpty else {
      print("⚠️ No measurements captured")
      return false
    }

    print("💾 Saving job \(jobId) with \(jobContext.measurements.count) measurements")

    // In production, this would POST to the backend
    // For now, we just log the data
    for measurement in jobContext.measurements {
      print("  - \(measurement.role.displayName): \(measurement.value)\(measurement.unit) @ \(measurement.timestamp)")
    }

    return true
  }
}
