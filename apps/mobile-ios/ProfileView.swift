import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var gameViewModel: GameViewModel
    @State private var showDeleteConfirmation = false

    var player: Character? {
        gameViewModel.currentPlayer
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let player = player {
                    VStack(spacing: 16) {
                        VStack(spacing: 8) {
                            Text(player.name)
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.white)

                            Text(player.archetype.rawValue)
                                .font(.subheadline)
                                .foregroundColor(Color.white.opacity(0.7))
                        }

                        HStack(spacing: 12) {
                            InfoBubble(label: "Level", value: "\(player.level)")
                            InfoBubble(label: "Joined", value: formatDate(player.createdAt))
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(12)

                    VStack(spacing: 12) {
                        SectionHeader(title: "Character Stats")

                        VStack(spacing: 12) {
                            StatRow(label: "Health", value: "\(player.health)%", color: Color(red: 1, green: 0.3, blue: 0.3))
                            StatRow(label: "Stamina", value: "\(player.stamina)%", color: Color(red: 1, green: 0.8, blue: 0.2))
                            StatRow(label: "Reputation", value: "\(player.reputation)", color: Color(red: 0.3, green: 0.8, blue: 1))
                        }
                        .padding()
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(12)
                    }

                    VStack(spacing: 12) {
                        SectionHeader(title: "Experience & Progress")

                        VStack(spacing: 8) {
                            HStack {
                                Text("Next Level")
                                    .foregroundColor(Color.white.opacity(0.7))

                                Spacer()

                                Text("\(player.experience) / \(player.experienceToNextLevel)")
                                    .font(.caption)
                                    .foregroundColor(Color.white.opacity(0.6))
                            }

                            ProgressView(value: player.experienceProgress)
                                .accentColor(Color(red: 0.8, green: 0.2, blue: 0.8))
                        }
                        .padding()
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(12)
                    }

                    VStack(spacing: 12) {
                        SectionHeader(title: "Career Summary")

                        VStack(spacing: 10) {
                            CareerRow(
                                icon: "briefcase.fill",
                                label: "Jobs Completed",
                                value: "\(gameViewModel.playerProgress.totalJobsCompleted)",
                                color: Color(red: 0.3, green: 0.8, blue: 1)
                            )

                            CareerRow(
                                icon: "dollarsign.circle.fill",
                                label: "Total Earned",
                                value: "$\(gameViewModel.playerProgress.totalMoneyEarned)",
                                color: Color(red: 0.3, green: 1, blue: 0.5)
                            )

                            CareerRow(
                                icon: "star.fill",
                                label: "Starting Balance",
                                value: "$\(player.archetype.startingBalance)",
                                color: Color(red: 0.8, green: 0.2, blue: 0.8)
                            )
                        }
                        .padding()
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(12)
                    }

                    VStack(spacing: 12) {
                        SectionHeader(title: "Money")

                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Current Balance")
                                    .foregroundColor(Color.white.opacity(0.7))
                                    .font(.caption)

                                Text("$\(player.money)")
                                    .font(.title2)
                                    .foregroundColor(Color(red: 0.3, green: 1, blue: 0.5))
                            }

                            Spacer()

                            VStack(alignment: .trailing, spacing: 4) {
                                Text("Profit")
                                    .foregroundColor(Color.white.opacity(0.7))
                                    .font(.caption)

                                let profit = player.money - player.archetype.startingBalance
                                Text(profit >= 0 ? "+$\(profit)" : "-$\(abs(profit))")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(profit >= 0 ? Color(red: 0.3, green: 1, blue: 0.5) : Color(red: 1, green: 0.3, blue: 0.3))
                            }
                        }
                        .padding()
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(12)
                    }

                    VStack(spacing: 12) {
                        Button(action: { showDeleteConfirmation = true }) {
                            HStack {
                                Image(systemName: "trash.fill")
                                Text("Delete Character")
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color(red: 1, green: 0.3, blue: 0.3).opacity(0.2))
                            .foregroundColor(Color(red: 1, green: 0.3, blue: 0.3))
                            .cornerRadius(8)
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(12)

                    Spacer().frame(height: 20)
                }
            }
            .padding()
        }
        .alert(isPresented: $showDeleteConfirmation) {
            Alert(
                title: Text("Delete Character"),
                message: Text("Are you sure? This cannot be undone."),
                primaryButton: .destructive(Text("Delete")) {
                    gameViewModel.deleteCharacter()
                },
                secondaryButton: .cancel()
            )
        }
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: date)
    }
}

struct SectionHeader: View {
    let title: String

    var body: some View {
        HStack {
            Text(title)
                .font(.headline)
                .foregroundColor(.white)

            Spacer()
        }
    }
}

struct InfoBubble: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
                .foregroundColor(Color(red: 0.8, green: 0.2, blue: 0.8))

            Text(label)
                .font(.caption2)
                .foregroundColor(Color.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.black.opacity(0.3))
        .cornerRadius(8)
    }
}

struct CareerRow: View {
    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(Color.white.opacity(0.6))

                Text(value)
                    .font(.headline)
                    .foregroundColor(.white)
            }

            Spacer()
        }
    }
}

#Preview {
    ProfileView()
        .environmentObject(GameViewModel())
}
