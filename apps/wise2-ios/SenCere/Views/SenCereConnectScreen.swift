import SwiftUI

struct SenCereConnectScreen: View {
  var body: some View {
    NavigationStack {
      List {
        Section {
          HStack {
            Spacer()
            VStack(spacing: 12) {
              SenCereEmblemView(size: 88, showGlow: false)
              Text(SenCereBrand.legalName)
                .font(.headline)
                .foregroundColor(.sencereGold)
            }
            Spacer()
          }
          .listRowBackground(Color.clear)
        }

        Section("Work with us") {
          SenCereLinkRow(title: "Get a Quote", icon: "doc.text.fill", url: SenCereBrand.quoteURL)
          SenCereLinkRow(title: "Book a Call", icon: "phone.fill", url: SenCereBrand.phoneTel)
          SenCereLinkRow(
            title: SenCereBrand.email,
            icon: "envelope.fill",
            url: URL(string: "mailto:\(SenCereBrand.email)")!
          )
        }

        Section("Shop & social") {
          SenCereLinkRow(title: "Blakk Hail Shop", icon: "bag.fill", url: SenCereBrand.shopURL)
          SenCereLinkRow(title: "@blakkhail on Instagram", icon: "camera.fill", url: SenCereBrand.instagramURL)
          SenCereLinkRow(title: "sencerecreative.com", icon: "globe", url: SenCereBrand.websiteURL)
        }

        Section {
          NavigationLink {
            SenCereSettingsScreen()
          } label: {
            Label("Settings", systemImage: "gearshape.fill")
          }
        }

        Section {
          Text(SenCereBrand.poweredByFooter)
            .font(.caption)
            .foregroundColor(.sencereTextMuted)
        }
      }
      .listStyle(.insetGrouped)
      .scrollContentBackground(.hidden)
      .sencereScreenBackground()
      .navigationTitle("Connect")
    }
  }
}

private struct SenCereLinkRow: View {
  let title: String
  let icon: String
  let url: URL

  var body: some View {
    Button {
      UIApplication.shared.open(url)
    } label: {
      Label(title, systemImage: icon)
        .foregroundColor(.sencereTextPrimary)
    }
    .listRowBackground(Color.sencereSurface)
  }
}
