import SwiftUI

struct DTFPrintingView: View {
  @StateObject private var dtfManager = DTFPrintingManager()
  @State private var showUploadSheet = false
  @State private var selectedImage: UIImage?

  var body: some View {
    ZStack {
      Color.blakkhailNavy.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 8) {
          Text("DTF PRINTING")
            .font(.system(size: 24, weight: .black))
            .foregroundColor(.blakkhailGold)
            .tracking(1.2)
          Text("Direct-to-Film custom apparel services")
            .font(.system(size: 12, weight: .light))
            .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.black.opacity(0.3))

        ScrollView {
          VStack(spacing: 20) {
            // Design Upload
            VStack(spacing: 12) {
              Text("UPLOAD DESIGN")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailCyan)
                .tracking(0.8)

              if let image = selectedImage {
                Image(uiImage: image)
                  .resizable()
                  .scaledToFit()
                  .frame(maxHeight: 200)
                  .cornerRadius(8)
              } else {
                VStack(spacing: 12) {
                  Image(systemName: "photo.badge.plus")
                    .font(.system(size: 40))
                    .foregroundColor(.blakkhailGold)
                  Text("Select Design")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                  Text("Choose image from library")
                    .font(.system(size: 12, weight: .light))
                    .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 180)
                .background(Color.black.opacity(0.3))
                .cornerRadius(8)
              }

              Button(action: { showUploadSheet = true }) {
                HStack {
                  Image(systemName: "photo.on.rectangle")
                  Text("UPLOAD DESIGN")
                    .font(.system(size: 13, weight: .bold))
                }
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Color.blakkhailCyan)
                .foregroundColor(.blakkhailNavy)
                .cornerRadius(6)
              }
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Apparel Options
            VStack(alignment: .leading, spacing: 12) {
              Text("SELECT APPAREL")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailGold)
                .tracking(0.8)

              VStack(spacing: 8) {
                ForEach(DTFApparelType.allCases, id: \.self) { type in
                  Button(action: { dtfManager.selectedApparel = type }) {
                    HStack {
                      Text(type.rawValue)
                        .font(.system(size: 13, weight: .semibold))
                      Spacer()
                      if dtfManager.selectedApparel == type {
                        Image(systemName: "checkmark.circle.fill")
                          .foregroundColor(.blakkhailNeon)
                      }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
                    .background(dtfManager.selectedApparel == type ? Color.blakkhailGold.opacity(0.2) : Color.black.opacity(0.2))
                    .foregroundColor(.white)
                    .cornerRadius(6)
                  }
                }
              }
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Quote & Pricing
            VStack(alignment: .leading, spacing: 12) {
              Text("PRICING")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailGold)
                .tracking(0.8)

              VStack(spacing: 8) {
                HStack {
                  Text("Design Fee:")
                    .foregroundColor(.gray)
                  Spacer()
                  Text("$25.00")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.blakkhailCyan)
                }
                HStack {
                  Text("Per Garment:")
                    .foregroundColor(.gray)
                  Spacer()
                  Text("$15.00+")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.blakkhailGold)
                }
              }
              .padding(12)
              .background(Color.black.opacity(0.3))
              .cornerRadius(6)
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Request Quote
            Button(action: { Task { await dtfManager.requestQuote() } }) {
              HStack {
                Image(systemName: "mail.fill")
                Text("REQUEST QUOTE")
                  .font(.system(size: 14, weight: .bold))
              }
              .frame(maxWidth: .infinity)
              .padding(14)
              .background(LinearGradient(
                gradient: Gradient(colors: [.blakkhailGold, Color(red: 0.65, green: 0.52, blue: 0.28)]),
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
    .sheet(isPresented: $showUploadSheet) {
      ImagePickerStyle(image: $selectedImage)
    }
  }
}

enum DTFApparelType: String, CaseIterable {
  case tshirt = "T-Shirt"
  case hoodie = "Hoodie"
  case sweatshirt = "Sweatshirt"
  case jacket = "Jacket"
  case totebag = "Tote Bag"
  case cap = "Cap"
}

@MainActor
class DTFPrintingManager: ObservableObject {
  @Published var selectedApparel: DTFApparelType = .tshirt
  @Published var isRequesting = false

  func requestQuote() async {
    isRequesting = true
    defer { isRequesting = false }

    print("✅ DTF Quote requested for \(selectedApparel.rawValue)")
    await Task.sleep(500_000_000)
  }
}

#Preview {
  DTFPrintingView()
    .preferredColorScheme(.dark)
}
