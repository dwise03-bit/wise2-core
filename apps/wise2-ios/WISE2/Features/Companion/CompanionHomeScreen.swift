import SwiftUI

struct CompanionHomeScreen: View {
  @StateObject private var commandStore = CommandStore()
  @State private var showShop = false

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 28) {
          VStack(alignment: .leading, spacing: 8) {
            Text(SenCereBrand.legalName)
              .font(.system(size: 28, weight: .semibold))
              .foregroundColor(.wise2TextPrimary)
            Text(SenCereBrand.tagline)
              .font(.subheadline)
              .foregroundColor(.wise2TextSecondary)
            Text(SenCereBrand.motto)
              .font(.headline)
              .foregroundColor(.wise2Gold)
          }

          if let dashboard = commandStore.dashboard {
            VStack(alignment: .leading, spacing: 12) {
              Text("Today")
                .font(.caption.weight(.semibold))
                .foregroundColor(.wise2TextMuted)
                .textCase(.uppercase)
              HStack(spacing: 12) {
                CompanionMetricCard(
                  title: "Revenue",
                  value: dashboard.revenueTodayFormatted
                )
                CompanionMetricCard(
                  title: "Hot leads",
                  value: "\(dashboard.hotLeadCount)"
                )
              }
            }
          } else if commandStore.isLoading {
            ProgressView()
              .tint(.wise2Gold)
          }

          VStack(spacing: 12) {
            CompanionPrimaryButton(title: "Open Blakk Hail Shop", icon: "bag.fill") {
              showShop = true
            }
            CompanionSecondaryButton(title: "Get a Quote", icon: "doc.text.fill") {
              UIApplication.shared.open(SenCereBrand.quoteURL)
            }
          }

          VStack(alignment: .leading, spacing: 12) {
            Text("Brands")
              .font(.caption.weight(.semibold))
              .foregroundColor(.wise2TextMuted)
              .textCase(.uppercase)
            CompanionBrandRow(name: "Blakk Hail", subtitle: "Original fashion · Est. 1994")
            CompanionBrandRow(name: "Piff City", subtitle: "Flagship label")
          }
        }
        .padding(20)
      }
      .background(Color.wise2Background.ignoresSafeArea())
      .navigationTitle("Home")
      .navigationBarTitleDisplayMode(.inline)
      .refreshable { await commandStore.load() }
      .task { await commandStore.load() }
      .fullScreenCover(isPresented: $showShop) {
        NavigationStack {
          CompanionShopScreen()
            .toolbar {
              ToolbarItem(placement: .cancellationAction) {
                Button("Done") { showShop = false }
              }
            }
        }
      }
    }
  }
}

private struct CompanionMetricCard: View {
  let title: String
  let value: String

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(title)
        .font(.caption)
        .foregroundColor(.wise2TextMuted)
      Text(value)
        .font(.title2.weight(.semibold))
        .foregroundColor(.wise2TextPrimary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(16)
    .background(Color.wise2Surface)
    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
  }
}

private struct CompanionBrandRow: View {
  let name: String
  let subtitle: String

  var body: some View {
    HStack {
      VStack(alignment: .leading, spacing: 4) {
        Text(name)
          .font(.headline)
          .foregroundColor(.wise2Gold)
        Text(subtitle)
          .font(.caption)
          .foregroundColor(.wise2TextSecondary)
      }
      Spacer()
      Image(systemName: "chevron.right")
        .font(.caption.weight(.semibold))
        .foregroundColor(.wise2TextMuted)
    }
    .padding(16)
    .background(Color.wise2Surface)
    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
  }
}

private struct CompanionPrimaryButton: View {
  let title: String
  let icon: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Label(title, systemImage: icon)
        .font(.body.weight(.semibold))
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.wise2Gold)
        .foregroundColor(.wise2Background)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
  }
}

private struct CompanionSecondaryButton: View {
  let title: String
  let icon: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Label(title, systemImage: icon)
        .font(.body.weight(.medium))
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(Color.wise2Surface)
        .foregroundColor(.wise2TextPrimary)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
          RoundedRectangle(cornerRadius: 14, style: .continuous)
            .stroke(Color.wise2BorderMedium, lineWidth: 1)
        )
    }
  }
}

private extension BusinessDashboard {
  var revenueTodayFormatted: String {
    String(format: "$%.0f", revenueToday)
  }
}
