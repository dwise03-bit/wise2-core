import SwiftUI

struct JobsView: View {
    @EnvironmentObject var gameViewModel: GameViewModel
    @State private var showingJobDetail: Job?
    @State private var showingJobTimer = false

    var player: Character? {
        gameViewModel.currentPlayer
    }

    var availableJobs: [Job] {
        gameViewModel.availableJobs.filter { job in
            job.archetypesAllowed.contains(player?.archetype ?? .entrepreneur)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            if let activeJob = gameViewModel.playerProgress.currentActiveJob {
                ActiveJobView(job: activeJob, onComplete: {
                    gameViewModel.completeJob(activeJob)
                })
            } else {
                ScrollView {
                    VStack(spacing: 12) {
                        if player?.stamina ?? 100 < 30 {
                            VStack(spacing: 8) {
                                HStack {
                                    Image(systemName: "exclamationmark.circle.fill")
                                        .foregroundColor(Color(red: 1, green: 0.8, blue: 0.2))
                                    Text("You're tired! Restore stamina before working.")
                                        .font(.caption)
                                        .foregroundColor(Color.white.opacity(0.8))
                                    Spacer()
                                }
                                .padding()
                                .background(Color(red: 1, green: 0.8, blue: 0.2).opacity(0.1))
                                .cornerRadius(8)
                            }
                            .padding()
                        }

                        Text("Available Jobs")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()

                        ForEach(availableJobs, id: \.id) { job in
                            JobCard(
                                job: job,
                                player: player,
                                onTap: {
                                    if player?.stamina ?? 0 >= 30 {
                                        gameViewModel.startJob(job)
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

struct JobCard: View {
    let job: Job
    let player: Character?
    let onTap: () -> Void

    var difficultyColor: Color {
        switch job.difficultyLevel {
        case 1:
            return Color(red: 0.3, green: 1, blue: 0.5)
        case 2:
            return Color(red: 1, green: 0.8, blue: 0.2)
        default:
            return Color(red: 1, green: 0.3, blue: 0.3)
        }
    }

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(job.title)
                            .font(.headline)
                            .foregroundColor(.white)

                        Text(job.company)
                            .font(.caption)
                            .foregroundColor(Color.white.opacity(0.6))
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 4) {
                        Text("$\(job.payPerHour)")
                            .font(.headline)
                            .foregroundColor(Color(red: 0.3, green: 1, blue: 0.5))

                        Text("/ job")
                            .font(.caption2)
                            .foregroundColor(Color.white.opacity(0.5))
                    }
                }

                Text(job.description)
                    .font(.caption)
                    .foregroundColor(Color.white.opacity(0.7))
                    .lineLimit(2)

                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        Image(systemName: "bolt.fill")
                            .font(.caption2)
                        Text("Difficulty \(job.difficultyLevel)")
                            .font(.caption2)
                    }
                    .foregroundColor(difficultyColor)

                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                        Text("+\(job.experienceReward) XP")
                            .font(.caption2)
                    }
                    .foregroundColor(Color(red: 0.8, green: 0.2, blue: 0.8))

                    HStack(spacing: 4) {
                        Image(systemName: "clock.fill")
                            .font(.caption2)
                        Text("\(job.durationMinutes)m")
                            .font(.caption2)
                    }
                    .foregroundColor(Color(red: 0.3, green: 0.8, blue: 1))

                    Spacer()
                }
            }
            .padding()
            .background(Color.white.opacity(0.05))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
            )
        }
        .padding(.horizontal)
        .disabled((player?.stamina ?? 0) < 30)
        .opacity((player?.stamina ?? 0) < 30 ? 0.5 : 1)
    }
}

struct ActiveJobView: View {
    let job: Job
    let onComplete: () -> Void
    @State private var timeRemaining: Int
    @State private var timer: Timer?

    init(job: Job, onComplete: @escaping () -> Void) {
        self.job = job
        self.onComplete = onComplete
        _timeRemaining = State(initialValue: job.durationMinutes * 60)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 12) {
                    Text("Working")
                        .font(.headline)
                        .foregroundColor(Color.white.opacity(0.7))

                    Text(job.title)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    Text(job.company)
                        .font(.subheadline)
                        .foregroundColor(Color.white.opacity(0.6))
                }

                VStack(spacing: 20) {
                    ZStack {
                        Circle()
                            .stroke(Color.white.opacity(0.1), lineWidth: 12)

                        Circle()
                            .trim(from: 0, to: CGFloat(1 - Double(timeRemaining) / Double(job.durationMinutes * 60)))
                            .stroke(
                                LinearGradient(
                                    gradient: Gradient(colors: [
                                        Color(red: 0.8, green: 0.2, blue: 0.8),
                                        Color(red: 0.3, green: 0.8, blue: 1)
                                    ]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                style: StrokeStyle(lineWidth: 12, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))

                        VStack(spacing: 4) {
                            Text(formatTime(timeRemaining))
                                .font(.system(size: 48, weight: .bold, design: .monospaced))
                                .foregroundColor(Color(red: 0.8, green: 0.2, blue: 0.8))

                            Text("Remaining")
                                .font(.caption)
                                .foregroundColor(Color.white.opacity(0.6))
                        }
                    }
                    .frame(height: 240)

                    VStack(spacing: 8) {
                        RewardRow(label: "Base Pay", value: "$\(job.payPerHour)", color: Color(red: 0.3, green: 1, blue: 0.5))
                        RewardRow(label: "Experience", value: "+\(job.experienceReward) XP", color: Color(red: 0.8, green: 0.2, blue: 0.8))
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(12)

                    Button(action: {
                        timer?.invalidate()
                        onComplete()
                    }) {
                        Text("Complete Job")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color(red: 0.3, green: 1, blue: 0.5))
                            .foregroundColor(Color(red: 0.1, green: 0.05, blue: 0.2))
                            .font(.system(.body, design: .default))
                            .cornerRadius(8)
                    }
                }
                .padding()

                Spacer()
            }
            .padding()
        }
        .onAppear {
            startTimer()
        }
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            } else {
                timer?.invalidate()
                onComplete()
            }
        }
    }

    private func formatTime(_ seconds: Int) -> String {
        let mins = seconds / 60
        let secs = seconds % 60
        return String(format: "%02d:%02d", mins, secs)
    }
}

struct RewardRow: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(Color.white.opacity(0.7))

            Spacer()

            Text(value)
                .font(.system(.body, design: .default))
                .foregroundColor(color)
        }
    }
}

#Preview {
    JobsView()
        .environmentObject(GameViewModel())
}
