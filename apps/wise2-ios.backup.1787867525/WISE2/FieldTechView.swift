import SwiftUI

struct FieldTechView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedJob: Job?
    @State private var showingDetails = false

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 16) {
                Text("Field Jobs")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(appState.jobs, id: \.id) { job in
                            JobRowView(job: job)
                                .onTapGesture {
                                    selectedJob = job
                                    showingDetails = true
                                }
                        }

                        if appState.jobs.isEmpty {
                            Text("No jobs available")
                                .foregroundColor(.gray)
                                .padding(32)
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showingDetails, content: {
            if let job = selectedJob {
                JobDetailView(job: job)
                    .environmentObject(appState)
            }
        })
    }
}

struct JobRowView: View {
    let job: Job

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(job.customerName)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    Text(job.address)
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text(job.priority.uppercased())
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(statusColor(job.priority))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.gray.opacity(0.2))
                        .cornerRadius(4)
                }
            }

            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Service")
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                    Text(job.serviceType)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.cyan)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("Status")
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                    Text(job.status.uppercased())
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.green)
                }
            }
        }
        .padding(12)
        .background(Color.gray.opacity(0.08))
        .border(Color.cyan.opacity(0.2), width: 1)
        .cornerRadius(4)
    }

    func statusColor(_ priority: String) -> Color {
        switch priority.lowercased() {
        case "high": return .red
        case "medium": return .yellow
        default: return .green
        }
    }
}

struct JobDetailView: View {
    let job: Job
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var newStatus = ""

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 16) {
                HStack {
                    Text("Job Details")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    Spacer()
                    Button("Close") {
                        dismiss()
                    }
                    .foregroundColor(.cyan)
                }
                .padding()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        DetailRow(label: "Customer", value: job.customerName)
                        DetailRow(label: "Address", value: job.address)
                        DetailRow(label: "Service", value: job.serviceType)
                        DetailRow(label: "Status", value: job.status)
                        DetailRow(label: "Priority", value: job.priority)
                        DetailRow(label: "Assigned To", value: job.assignedTo)
                        DetailRow(label: "Scheduled", value: job.scheduledDate)
                        DetailRow(label: "Duration", value: "\(job.estimatedDuration) min")

                        if let notes = job.notes {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Notes")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.gray)
                                Text(notes)
                                    .font(.system(size: 13))
                                    .foregroundColor(.white)
                            }
                        }

                        HStack(spacing: 12) {
                            Button("Mark Complete") {
                                Task {
                                    await appState.updateJobStatus(job.id, status: "completed")
                                    dismiss()
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(12)
                            .background(Color.green.opacity(0.3))
                            .foregroundColor(.green)
                            .border(Color.green, width: 1)

                            Button("Start Job") {
                                Task {
                                    await appState.updateJobStatus(job.id, status: "in_progress")
                                    dismiss()
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(12)
                            .background(Color.cyan.opacity(0.3))
                            .foregroundColor(.cyan)
                            .border(Color.cyan, width: 1)
                        }
                    }
                    .padding()
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.gray)
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
        }
    }
}

#Preview {
    FieldTechView()
        .environmentObject(AppState())
}
