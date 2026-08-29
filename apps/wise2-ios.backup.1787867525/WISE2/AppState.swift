import Foundation

@MainActor
class AppState: ObservableObject {
    @Published var jobs: [Job] = []
    @Published var dashboardMetrics: DashboardMetrics?
    @Published var automations: [Automation] = []
    @Published var activities: [Activity] = []
    @Published var errorMessage: String?
    @Published var isLoading = false

    private let apiClient = APIClient.shared

    func loadJobs() async {
        isLoading = true
        defer { isLoading = false }

        do {
            jobs = try await apiClient.fetchJobs()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateJobStatus(_ jobId: String, status: String) async {
        do {
            let updatedJob = try await apiClient.updateJobStatus(jobId: jobId, status: status)
            if let index = jobs.firstIndex(where: { $0.id == jobId }) {
                jobs[index] = updatedJob
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadDashboardData() async {
        isLoading = true
        defer { isLoading = false }

        do {
            dashboardMetrics = try await apiClient.getDashboardMetrics()
            activities = try await apiClient.getRecentActivity()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadAutomations() async {
        do {
            automations = try await apiClient.fetchAutomations()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func executeAutomation(_ automationId: String) async {
        do {
            try await apiClient.executeAutomation(automationId: automationId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
