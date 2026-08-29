import SwiftUI

struct AnalyticsView: View {
    @State private var selectedPeriod = "7d"
    @EnvironmentObject var appState: AppState
    @State private var analyticsData: AnalyticsData?

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 16) {
                Text("Analytics")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                Picker("Period", selection: $selectedPeriod) {
                    Text("24h").tag("24h")
                    Text("7d").tag("7d")
                    Text("30d").tag("30d")
                    Text("90d").tag("90d")
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .onChange(of: selectedPeriod) { newPeriod in
                    Task {
                        do {
                            analyticsData = try await APIClient.shared.getAnalytics(period: newPeriod)
                        } catch {
                            appState.errorMessage = error.localizedDescription
                        }
                    }
                }

                ScrollView {
                    if let data = analyticsData {
                        VStack(spacing: 16) {
                            ForEach(data.metrics, id: \.name) { metric in
                                MetricCardView(metric: metric)
                            }
                        }
                        .padding(.horizontal)
                    } else {
                        Text("Loading analytics...")
                            .foregroundColor(.gray)
                            .padding(32)
                    }
                }
            }
        }
        .preferredColorScheme(.dark)
        .onAppear {
            Task {
                do {
                    analyticsData = try await APIClient.shared.getAnalytics(period: selectedPeriod)
                } catch {
                    appState.errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct MetricCardView: View {
    let metric: AnalyticMetric

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(metric.name)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(String(format: "%.2f", metric.value))
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.cyan)
                    HStack(spacing: 4) {
                        Image(systemName: metric.trend.direction == "up" ? "arrow.up" : "arrow.down")
                            .font(.system(size: 10, weight: .bold))
                        Text(String(format: "%.1f%%", metric.trend.percentage))
                            .font(.system(size: 12))
                    }
                    .foregroundColor(metric.trend.direction == "up" ? .green : .red)
                }
            }

            if !metric.dataPoints.isEmpty {
                Canvas { context, size in
                    let width = size.width - 20
                    let height = size.height - 20
                    let maxValue = metric.dataPoints.map(\.value).max() ?? 1
                    let minValue = metric.dataPoints.map(\.value).min() ?? 0

                    let points = metric.dataPoints.enumerated().map { index, point in
                        let x = (Double(index) / Double(max(metric.dataPoints.count - 1, 1))) * width + 10
                        let normalized = (point.value - minValue) / max(maxValue - minValue, 1)
                        let y = height - (normalized * (height - 20)) + 10
                        return CGPoint(x: x, y: y)
                    }

                    if points.count > 1 {
                        var path = Path()
                        path.move(to: points[0])
                        for point in points.dropFirst() {
                            path.addLine(to: point)
                        }
                        context.stroke(path, with: .color(.cyan), lineWidth: 2)
                    }

                    for (_, point) in points.enumerated() {
                        var circlePath = Path()
                        circlePath.addEllipse(in: CGRect(x: point.x - 3, y: point.y - 3, width: 6, height: 6))
                        context.fill(circlePath, with: .color(.cyan))
                    }
                }
                .frame(height: 100)
                .background(Color.gray.opacity(0.05))
                .border(Color.gray.opacity(0.2), width: 1)
            }
        }
        .padding(12)
        .background(Color.gray.opacity(0.08))
        .border(Color.cyan.opacity(0.2), width: 1)
        .cornerRadius(4)
    }
}

#Preview {
    AnalyticsView()
        .environmentObject(AppState())
}
