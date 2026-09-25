import SwiftUI

struct ThreeDPrintingView: View {
  @StateObject private var printManager = ThreeDPrintingManager()
  @State private var showFileUpload = false

  var body: some View {
    ZStack {
      Color.blakkhailNavy.ignoresSafeArea()

      VStack(spacing: 0) {
        VStack(spacing: 8) {
          Text("3D PRINTING")
            .font(.system(size: 24, weight: .black))
            .foregroundColor(.blakkhailNeon)
            .tracking(1.2)
          Text("Professional CAD to physical models")
            .font(.system(size: 12, weight: .light))
            .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.black.opacity(0.3))

        ScrollView {
          VStack(spacing: 20) {
            // File Upload
            VStack(spacing: 12) {
              Text("UPLOAD CAD FILE")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailCyan)
                .tracking(0.8)

              VStack(spacing: 12) {
                Image(systemName: "cube.box")
                  .font(.system(size: 40))
                  .foregroundColor(.blakkhailNeon)
                Text("Supported Formats")
                  .font(.system(size: 14, weight: .bold))
                  .foregroundColor(.white)
                Text("STL, OBJ, STEP, IGES")
                  .font(.system(size: 12, weight: .light))
                  .foregroundColor(.gray)
              }
              .frame(maxWidth: .infinity)
              .frame(height: 180)
              .background(Color.black.opacity(0.3))
              .cornerRadius(8)

              Button(action: { showFileUpload = true }) {
                HStack {
                  Image(systemName: "doc.badge.plus")
                  Text("UPLOAD CAD FILE")
                    .font(.system(size: 13, weight: .bold))
                }
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color.blakkhailNeon)
                .foregroundColor(.blakkhailNavy)
                .cornerRadius(6)
              }
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Materials
            VStack(alignment: .leading, spacing: 12) {
              Text("SELECT MATERIAL")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailGold)
                .tracking(0.8)

              VStack(spacing: 8) {
                ForEach(PrintMaterial.allCases, id: \.self) { material in
                  Button(action: { printManager.selectedMaterial = material }) {
                    HStack {
                      VStack(alignment: .leading, spacing: 2) {
                        Text(material.name)
                          .font(.system(size: 13, weight: .semibold))
                        Text(material.description)
                          .font(.system(size: 11, weight: .light))
                          .foregroundColor(.gray)
                      }
                      Spacer()
                      if printManager.selectedMaterial == material {
                        Image(systemName: "checkmark.circle.fill")
                          .foregroundColor(.blakkhailNeon)
                      }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
                    .background(printManager.selectedMaterial == material ? Color.blakkhailNeon.opacity(0.2) : Color.black.opacity(0.2))
                    .foregroundColor(.white)
                    .cornerRadius(6)
                  }
                }
              }
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Quality Settings
            VStack(alignment: .leading, spacing: 12) {
              Text("PRINT QUALITY")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailGold)
                .tracking(0.8)

              VStack(spacing: 8) {
                ForEach(PrintQuality.allCases, id: \.self) { quality in
                  Button(action: { printManager.selectedQuality = quality }) {
                    HStack {
                      Text(quality.rawValue)
                        .font(.system(size: 13, weight: .semibold))
                      Spacer()
                      if printManager.selectedQuality == quality {
                        Image(systemName: "checkmark.circle.fill")
                          .foregroundColor(.blakkhailCyan)
                      }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
                    .background(printManager.selectedQuality == quality ? Color.blakkhailCyan.opacity(0.2) : Color.black.opacity(0.2))
                    .foregroundColor(.white)
                    .cornerRadius(6)
                  }
                }
              }
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Request Quote
            Button(action: { Task { await printManager.requestQuote() } }) {
              HStack {
                Image(systemName: "checkmark.seal.fill")
                Text("REQUEST 3D QUOTE")
                  .font(.system(size: 14, weight: .bold))
              }
              .frame(maxWidth: .infinity)
              .padding(14)
              .background(LinearGradient(
                gradient: Gradient(colors: [.blakkhailNeon, Color(red: 0.0, green: 0.8, blue: 0.4)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              ))
              .foregroundColor(.blakkhailNavy)
              .cornerRadius(6)
            }
            .padding(16)
          }
        }
      }
    }
  }
}

enum PrintMaterial: CaseIterable, Hashable {
  case pla
  case abs
  case petg
  case nylon
  case resine

  var name: String {
    switch self {
    case .pla: return "PLA"
    case .abs: return "ABS"
    case .petg: return "PETG"
    case .nylon: return "Nylon"
    case .resine: return "Resin"
    }
  }

  var description: String {
    switch self {
    case .pla: return "Standard biodegradable"
    case .abs: return "Durable & heat-resistant"
    case .petg: return "Strong & flexible"
    case .nylon: return "Industrial grade"
    case .resine: return "High detail UV"
    }
  }
}

enum PrintQuality: String, CaseIterable, Hashable {
  case draft = "Draft (Fast)"
  case standard = "Standard (Balanced)"
  case fine = "Fine (Detailed)"
  case ultra = "Ultra (Premium)"
}

@MainActor
class ThreeDPrintingManager: ObservableObject {
  @Published var selectedMaterial: PrintMaterial = .pla
  @Published var selectedQuality: PrintQuality = .standard
  @Published var isRequesting = false

  func requestQuote() async {
    isRequesting = true
    defer { isRequesting = false }

    print("✅ 3D Quote requested - Material: \(selectedMaterial.name), Quality: \(selectedQuality.rawValue)")
    await Task.sleep(500_000_000)
  }
}

#Preview {
  ThreeDPrintingView()
    .preferredColorScheme(.dark)
}
