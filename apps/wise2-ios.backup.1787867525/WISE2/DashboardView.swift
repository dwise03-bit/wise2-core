import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var appState: AppState
    @State private var isRefreshing = false

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    Text("Dashboard")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal)

                    if let metrics = appState.dashboardMetrics {
                        // System Health Card
                        VStack(spacing: 12) {
                            HStack {
                                Text("System Health")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white)
                                Spacer()
                                Text(metrics.systemHealth.status.uppercased())
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(metrics.systemHealth.status == "healthy" ? .green : .red)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.gray.opacity(0.2))
                                    .cornerRadius(4)
                            }

                            VStack(spacing: 8) {
                                ForEach(metrics.systemHealth.services, id: \.name) { service in
                                    HStack {
                                        Text(service.name)
                                            .font(.system(size: 14))
                                            .foregroundColor(.gray)
                                        Spacer()
                                        Text(service.status)
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(.cyan)
                                    }
                                }
                            }
                        }
                        .padding(16)
                        .background(Color.gray.opacity(0.1))
                        .border(Color.cyan.opacity(0.3), width: 1)
                        .padding(.horizontal)

                        // KPI Metrics
                        VStack(spacing: 12) {
                            ForEach(metrics.kpis, id: \.name) { kpi in
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(kpi.name)
                                            .font(.system(size: 14))
                                            .foregroundColor(.gray)
                                        Text(String(format: "%.0f", kpi.value))
                                            .font(.system(size: 24, weight: .bold))
                                            .foregroundColor(.cyan)
                                    }
                                    Spacer()
                                    VStack(alignment: .trailing, spacing: 4) {
                                        Text(kpi.trend)
                                            .font(.system(size: 12))
                                            .foregroundColor(kpi.trend.contains("↑") ? .green : .red)
                                        Text(kpi.unit)
                                            .font(.system(size: 12))
                                            .foregroundColor(.gray)
                                    }
                                }
                                .padding(12)
                                .background(Color.gray.opacity(0.05))
                                .border(Color.gray.opacity(0.2), width: 1)
                            }
                        }
                        .padding(.horizontal)

                        // Activity Feed
                        VStack(spacing: 12) {
                            Text("Recent Activity")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal)

                            VStack(spacing: 8) {
                                ForEach(metrics.recentActivity.prefix(5), id: \.id) { activity in
                                    HStack(spacing: 12) {
                                        Circle()
                                            .fill(Color.cyan.opacity(0.3))
                                            .frame(width: 8, height: 8)

                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(activity.description)
                                                .font(.system(size: 14))
                                                .foregroundColor(.white)
                                            Text(activity.timestamp)
                                                .font(.system(size: 12))
                                                .foregroundColor(.gray)
                                        }
                                        Spacer()
                                    }
                                    .padding(12)
                                    .background(Color.gray.opacity(0.05))
                                }
                            }
                            .padding(.horizontal)
                        }
                    }

                    Spacer(minLength: 20)
                }
                .padding(.vertical)
            }
            .refreshable {
                isRefreshing = true
                await appState.loadDashboardData()
                isRefreshing = false
            }
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    DashboardView()
        .environmentObject(AppState())
}
