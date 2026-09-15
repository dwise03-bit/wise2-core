import SwiftUI

struct BrandStoryView: View {
  var body: some View {
    ZStack {
      Color.blakkhailNavy
        .ignoresSafeArea()

      ScrollView {
        VStack(spacing: 0) {
          // Hero Image Section
          Rectangle()
            .fill(
              LinearGradient(
                gradient: Gradient(colors: [
                  Color.blakkhailGold.opacity(0.2),
                  Color.blakkhailGold.opacity(0.05)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              )
            )
            .frame(height: 250)

          VStack(spacing: 24) {
            // Header
            VStack(spacing: 12) {
              Text("THE STORY")
                .font(.system(size: 12, weight: .bold, design: .default))
                .tracking(2)
                .foregroundColor(.blakkhailGold)

              Text("HERITAGE STREETWEAR SINCE 1994")
                .font(.system(size: 32, weight: .black, design: .default))
                .tracking(-0.5)
                .foregroundColor(.blakkhailGold)
                .shadow(color: .blakkhailGold.opacity(0.3), radius: 10, x: 0, y: 0)
            }

            // Narrative
            VStack(spacing: 16) {
              Text("Blakk Hail was born from a vision to create authentic streetwear that tells a story. For over 30 years, we've been designing pieces that capture the essence of street culture and original fashion.")
                .font(.system(size: 14, weight: .light))
                .foregroundColor(.gray)
                .tracking(0.3)
                .lineHeight(1.8)

              Text("Every piece in our collection carries the legacy of those who came before. We don't just make clothes—we create statements. We design for the culture. We build for the future.")
                .font(.system(size: 14, weight: .light))
                .foregroundColor(.gray)
                .tracking(0.3)
                .lineHeight(1.8)
            }

            // Values
            VStack(spacing: 16) {
              ValueCard(
                label: "ORIGINAL",
                text: "Designed with authenticity at the core"
              )

              ValueCard(
                label: "LEGACY",
                text: "Three decades of streetwear excellence"
              )

              ValueCard(
                label: "CULTURE",
                text: "Built by the community, for the community"
              )
            }

            // CTA
            NavigationLink(destination: ProductCatalogView()) {
              HStack {
                Text("EXPLORE COLLECTION")
                  .font(.system(size: 12, weight: .black, design: .default))
                  .tracking(1)
                Image(systemName: "arrow.right")
              }
              .foregroundColor(.blakkhailCyan)
              .padding(.bottom, 4)
              .borderBottom(width: 2, color: .blakkhailCyan)
            }
            .padding(.top, 12)

            // Timeline
            VStack(spacing: 12) {
              TimelineItem(year: "1994", title: "Est. Blakk Hail", description: "Legacy streetwear founded")
              TimelineItem(year: "2004", title: "Street Presence", description: "Expanded to boutiques")
              TimelineItem(year: "2014", title: "Cultural Icon", description: "20 years strong")
              TimelineItem(year: "2024", title: "Global Impact", description: "3 decades of authenticity")
            }
            .padding(.top, 12)
          }
          .padding(24)
          .background(
            RoundedRectangle(cornerRadius: 12)
              .fill(Color.blakkhailNavy.opacity(0.4))
              .stroke(Color.blakkhailGold.opacity(0.2), lineWidth: 1)
          )
          .padding(16)
        }
      }
    }
    .navigationTitle("")
    .navigationBarTitleDisplayMode(.inline)
  }
}

// MARK: - Value Card
struct ValueCard: View {
  let label: String
  let text: String

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(label)
        .font(.system(size: 11, weight: .black, design: .default))
        .tracking(2)
        .foregroundColor(.blakkhailGold)

      Text(text)
        .font(.system(size: 13, weight: .light))
        .foregroundColor(.gray)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(12)
    .borderLeft(width: 4, color: .blakkhailGold)
  }
}

// MARK: - Timeline Item
struct TimelineItem: View {
  let year: String
  let title: String
  let description: String

  var body: some View {
    HStack(spacing: 16) {
      VStack(spacing: 4) {
        Circle()
          .fill(Color.blakkhailGold)
          .frame(width: 12, height: 12)

        Rectangle()
          .fill(Color.blakkhailGold.opacity(0.3))
          .frame(width: 2)
          .frame(minHeight: 40)
      }

      VStack(alignment: .leading, spacing: 2) {
        Text(year)
          .font(.system(size: 12, weight: .bold, design: .default))
          .foregroundColor(.blakkhailGold)

        Text(title)
          .font(.system(size: 13, weight: .bold))

        Text(description)
          .font(.system(size: 12, weight: .light))
          .foregroundColor(.gray)
      }

      Spacer()
    }
  }
}

// MARK: - Border Extensions
extension View {
  func borderLeft(width: CGFloat, color: Color) -> some View {
    self
      .overlay(alignment: .leading) {
        Rectangle()
          .fill(color)
          .frame(width: width)
      }
  }

  func borderBottom(width: CGFloat, color: Color) -> some View {
    self
      .overlay(alignment: .bottom) {
        Rectangle()
          .fill(color)
          .frame(height: width)
      }
  }

  func lineHeight(_ lineHeight: CGFloat) -> some View {
    self
  }
}

#Preview {
  BrandStoryView()
    .preferredColorScheme(.dark)
}
