import SwiftUI

struct SenCereDashboardScreen: View {
  @StateObject private var apiService = SenCereAPIService()

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: 24) {
          // Header
          VStack(alignment: .leading, spacing: 8) {
            Text("Good morning")
              .font(.subheadline)
              .foregroundColor(.gray)
            HStack {
              VStack(alignment: .leading, spacing: 4) {
                Text("SenCere Team")
                  .font(.title2)
                  .fontWeight(.bold)
                  .foregroundColor(.white)
                Text("Here's what's happening today.")
                  .font(.caption)
                  .foregroundColor(.gray)
              }
              Spacer()
              Circle()
                .fill(Color.sencereGold.opacity(0.2))
                .frame(width: 44, height: 44)
                .overlay(
                  Text("👤")
                    .font(.system(size: 20))
                )
            }
          }
          .padding(16)
          .frame(maxWidth: .infinity, alignment: .leading)

          // KPI Cards
          VStack(spacing: 12) {
            HStack(spacing: 12) {
              KPICard(
                title: "Active",
                value: "12",
                icon: "📊",
                color: .sencereGold
              )
              KPICard(
                title: "Quotes Sent",
                value: "5",
                icon: "📝",
                color: .sencereGold.opacity(0.7)
              )
              KPICard(
                title: "Orders in Pickup",
                value: "8",
                icon: "📦",
                color: .sencereGold.opacity(0.5)
              )
            }
          }
          .padding(16)

          // Recent Activity
          VStack(alignment: .leading, spacing: 12) {
            HStack {
              Text("RECENT ACTIVITY")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.gray)
              Spacer()
              NavigationLink(destination: Text("View All")) {
                Text("View All")
                  .font(.caption)
                  .foregroundColor(.sencereGold)
              }
            }

            VStack(spacing: 12) {
              ForEach(apiService.recentActivity.prefix(4), id: \.id) { activity in
                HStack(spacing: 12) {
                  Text(activity.icon)
                    .font(.system(size: 20))
                  VStack(alignment: .leading, spacing: 4) {
                    Text(activity.title)
                      .font(.subheadline)
                      .fontWeight(.semibold)
                      .foregroundColor(.white)
                    Text(activity.description)
                      .font(.caption)
                      .foregroundColor(.gray)
                  }
                  Spacer()
                  Text(formatTime(activity.timestamp))
                    .font(.caption)
                    .foregroundColor(.gray)
                }
                .padding(12)
                .background(Color.white.opacity(0.05))
                .cornerRadius(8)
              }
            }
          }
          .padding(16)

          // Quick Actions
          VStack(alignment: .leading, spacing: 12) {
            Text("QUICK ACTIONS")
              .font(.caption)
              .fontWeight(.bold)
              .foregroundColor(.gray)

            LazyVGrid(
              columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
              ],
              spacing: 12
            ) {
              QuickActionButton(icon: "📁", label: "My Projects")
              QuickActionButton(icon: "🛒", label: "Orders")
              QuickActionButton(icon: "💰", label: "Quotes")
              QuickActionButton(icon: "📐", label: "Designs")
              QuickActionButton(icon: "💬", label: "Messages")
              QuickActionButton(icon: "📝", label: "Designs")
              QuickActionButton(icon: "☁️", label: "Uploads")
              QuickActionButton(icon: "⚙️", label: "Reorders")
            }
          }
          .padding(16)
        }
      }
      .background(Color.black)
      .navigationBarTitleDisplayMode(.inline)
    }
    .task {
      await apiService.fetchRecentActivity()
    }
  }

  private func formatTime(_ date: Date) -> String {
    let formatter = DateComponentsFormatter()
    formatter.allowedUnits = [.day, .hour, .minute]
    formatter.maximumUnitCount = 1
    formatter.unitsStyle = .abbreviated
    return formatter.string(from: date, to: Date()) ?? "now"
  }
}

struct KPICard: View {
  let title: String
  let value: String
  let icon: String
  let color: Color

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text(value)
            .font(.title3)
            .fontWeight(.bold)
            .foregroundColor(.white)
          Text(title)
            .font(.caption)
            .foregroundColor(.gray)
        }
        Spacer()
        Text(icon)
          .font(.system(size: 24))
      }
    }
    .padding(12)
    .background(color.opacity(0.1))
    .border(color.opacity(0.3), width: 1)
    .cornerRadius(8)
  }
}

struct QuickActionButton: View {
  let icon: String
  let label: String

  var body: some View {
    VStack(spacing: 8) {
      Text(icon)
        .font(.system(size: 24))
      Text(label)
        .font(.caption2)
        .foregroundColor(.gray)
    }
    .frame(maxWidth: .infinity)
    .frame(height: 60)
    .background(Color.white.opacity(0.05))
    .border(Color.white.opacity(0.1), width: 1)
    .cornerRadius(8)
  }
}

#Preview {
  SenCereDashboardScreen()
    .preferredColorScheme(.dark)
}
