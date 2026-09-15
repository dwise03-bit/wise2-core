import Foundation
import ARKit
import Vision
import Combine

@available(iOS 14.0, *)
class ARAnnotationEngine: NSObject, ObservableObject {
  @Published var arSession: ARSession?
  @Published var detections: [DetectionAnnotation] = []
  @Published var userAnnotations: [UserAnnotation] = []
  @Published var isARSupported = ARWorldTrackingConfiguration.isSupported
  @Published var arError: String?

  private var cancellables = Set<AnyCancellable>()
  private let logger = Logger(subsystem: "com.wise2.rayban", category: "ARAnnotationEngine")

  override init() {
    super.init()
    setupAR()
  }

  // MARK: - AR Session Management

  private func setupAR() {
    guard ARWorldTrackingConfiguration.isSupported else {
      self.arError = "AR not supported on this device"
      return
    }

    let session = ARSession()
    let config = ARWorldTrackingConfiguration()

    if ARWorldTrackingConfiguration.supportsFrameSemantics(.personSegmentationWithDepth) {
      config.frameSemantics.insert(.personSegmentationWithDepth)
    }

    if ARWorldTrackingConfiguration.supportsFrameSemantics(.personSegmentation) {
      config.frameSemantics.insert(.personSegmentation)
    }

    session.run(config)
    self.arSession = session
    self.logger.log("AR session initialized")
  }

  // MARK: - Detection Rendering

  func addDetection(
    classification: String,
    confidence: Double,
    boundingBox: BoundingBox,
    label: String
  ) {
    let annotation = DetectionAnnotation(
      id: UUID().uuidString,
      timestamp: Date(),
      classification: classification,
      confidence: confidence,
      boundingBox: boundingBox,
      label: label,
      color: confidenceColor(confidence)
    )

    DispatchQueue.main.async {
      self.detections.append(annotation)
      self.logger.log("Detection added: \(classification) (\(confidence.formatted(.percent.precision(.fractionLength(2)))))")
    }
  }

  func removeDetection(_ id: String) {
    DispatchQueue.main.async {
      self.detections.removeAll { $0.id == id }
    }
  }

  func clearDetections() {
    DispatchQueue.main.async {
      self.detections.removeAll()
    }
  }

  // MARK: - User Annotations (Drawing)

  func addUserAnnotation(
    type: AnnotationType,
    points: [CGPoint],
    color: UIColor,
    text: String? = nil
  ) {
    let annotation = UserAnnotation(
      id: UUID().uuidString,
      timestamp: Date(),
      type: type,
      points: points,
      color: color,
      text: text
    )

    DispatchQueue.main.async {
      self.userAnnotations.append(annotation)
      self.logger.log("User annotation added: \(type)")
    }
  }

  func removeUserAnnotation(_ id: String) {
    DispatchQueue.main.async {
      self.userAnnotations.removeAll { $0.id == id }
    }
  }

  func clearUserAnnotations() {
    DispatchQueue.main.async {
      self.userAnnotations.removeAll()
    }
  }

  // MARK: - AR Rendering (Canvas)

  func renderAnnotations(on context: CGContext, canvasSize: CGSize) {
    // Render detections (ML boxes)
    for detection in detections {
      renderDetectionBox(detection, on: context, canvasSize: canvasSize)
    }

    // Render user annotations
    for annotation in userAnnotations {
      renderUserAnnotation(annotation, on: context, canvasSize: canvasSize)
    }
  }

  private func renderDetectionBox(
    _ detection: DetectionAnnotation,
    on context: CGContext,
    canvasSize: CGSize
  ) {
    let bbox = detection.boundingBox
    let rect = CGRect(
      x: bbox.x * canvasSize.width,
      y: bbox.y * canvasSize.height,
      width: bbox.width * canvasSize.width,
      height: bbox.height * canvasSize.height
    )

    // Draw box
    context.setStrokeColor(detection.color.cgColor)
    context.setLineWidth(3)
    context.stroke(rect)

    // Draw label
    let label = "\(detection.classification) \(detection.confidence.formatted(.percent.precision(.fractionLength(0))))"
    let font = UIFont.boldSystemFont(ofSize: 12)
    let labelRect = CGRect(x: rect.minX, y: rect.minY - 20, width: 200, height: 20)

    context.setFillColor(detection.color.cgColor)
    context.fill(labelRect)

    let nsLabel = label as NSString
    nsLabel.draw(in: labelRect, withAttributes: [
      .font: font,
      .foregroundColor: UIColor.white,
    ])
  }

  private func renderUserAnnotation(
    _ annotation: UserAnnotation,
    on context: CGContext,
    canvasSize: CGSize
  ) {
    context.setStrokeColor(annotation.color.cgColor)
    context.setFillColor(annotation.color.withAlphaComponent(0.3).cgColor)
    context.setLineWidth(2)

    switch annotation.type {
    case .circle:
      if annotation.points.count >= 2 {
        let center = annotation.points[0]
        let radiusPoint = annotation.points[1]
        let radius = hypot(radiusPoint.x - center.x, radiusPoint.y - center.y)
        let circle = CGPath(ellipseIn: CGRect(
          x: center.x - radius,
          y: center.y - radius,
          width: radius * 2,
          height: radius * 2
        ), transform: nil)
        context.addPath(circle)
        context.drawPath(using: .fillStroke)
      }

    case .arrow:
      if annotation.points.count >= 2 {
        let start = annotation.points[0]
        let end = annotation.points[1]
        drawArrow(from: start, to: end, on: context)
      }

    case .rectangle:
      if annotation.points.count >= 2 {
        let rect = CGRect(
          x: min(annotation.points[0].x, annotation.points[1].x),
          y: min(annotation.points[0].y, annotation.points[1].y),
          width: abs(annotation.points[1].x - annotation.points[0].x),
          height: abs(annotation.points[1].y - annotation.points[0].y)
        )
        context.addRect(rect)
        context.drawPath(using: .fillStroke)
      }

    case .text:
      if let text = annotation.text, !annotation.points.isEmpty {
        let font = UIFont.systemFont(ofSize: 14)
        let textRect = CGRect(x: annotation.points[0].x, y: annotation.points[0].y, width: 200, height: 30)
        (text as NSString).draw(in: textRect, withAttributes: [
          .font: font,
          .foregroundColor: annotation.color,
        ])
      }

    case .detection_box:
      // Handled separately
      break
    }
  }

  private func drawArrow(from: CGPoint, to: CGPoint, on context: CGContext) {
    let headlen: CGFloat = 15
    let angle = atan2(to.y - from.y, to.x - from.x)

    // Draw line
    context.move(to: from)
    context.addLine(to: to)
    context.strokePath()

    // Draw arrowhead
    let p1 = CGPoint(
      x: to.x - headlen * cos(angle - .pi / 6),
      y: to.y - headlen * sin(angle - .pi / 6)
    )
    let p2 = CGPoint(
      x: to.x - headlen * cos(angle + .pi / 6),
      y: to.y - headlen * sin(angle + .pi / 6)
    )

    context.move(to: to)
    context.addLine(to: p1)
    context.move(to: to)
    context.addLine(to: p2)
    context.strokePath()
  }

  // MARK: - Helpers

  private func confidenceColor(_ confidence: Double) -> UIColor {
    if confidence >= 0.9 { return UIColor(red: 1, green: 0, blue: 0, alpha: 1) } // Red: >90%
    if confidence >= 0.8 { return UIColor(red: 1, green: 0.5, blue: 0, alpha: 1) } // Orange: >80%
    return UIColor(red: 1, green: 1, blue: 0, alpha: 1) // Yellow: <80%
  }

  func stopAR() {
    arSession?.pause()
    arSession = nil
    self.logger.log("AR session stopped")
  }

  deinit {
    stopAR()
  }
}

// MARK: - Data Models

struct DetectionAnnotation: Identifiable {
  let id: String
  let timestamp: Date
  let classification: String
  let confidence: Double
  let boundingBox: BoundingBox
  let label: String
  let color: UIColor
}

struct UserAnnotation: Identifiable {
  let id: String
  let timestamp: Date
  let type: AnnotationType
  let points: [CGPoint]
  let color: UIColor
  let text: String?
}

struct BoundingBox {
  let x: Double
  let y: Double
  let width: Double
  let height: Double
}

enum AnnotationType: String {
  case circle
  case arrow
  case rectangle
  case text
  case detection_box
}
