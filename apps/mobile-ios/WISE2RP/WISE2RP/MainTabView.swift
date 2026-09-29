import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var gameViewModel: GameViewModel
    @State private var selectedTab = 0

    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.1, green: 0.05, blue: 0.2),
                    Color(red: 0.15, green: 0.1, blue: 0.25)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                if selectedTab == 0 {
                    DashboardView()
                } else if selectedTab == 1 {
                    JobsView()
                } else {
                    ProfileView()
                }

                Spacer()

                HStack(spacing: 0) {
                    TabBarItem(
                        icon: "chart.bar.fill",
                        label: "Dashboard",
                        isSelected: selectedTab == 0,
                        action: { selectedTab = 0 }
                    )

                    TabBarItem(
                        icon: "briefcase.fill",
                        label: "Jobs",
                        isSelected: selectedTab == 1,
                        action: { selectedTab = 1 }
                    )

                    TabBarItem(
                        icon: "person.fill",
                        label: "Profile",
                        isSelected: selectedTab == 2,
                        action: { selectedTab = 2 }
                    )
                }
                .background(Color.black.opacity(0.6))
            }
        }
    }
}

struct TabBarItem: View {
    let icon: String
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(label)
                    .font(.caption2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .foregroundColor(
                isSelected ? Color(red: 0.8, green: 0.2, blue: 0.8) : Color.white.opacity(0.6)
            )
        }
    }
}

struct DashboardView: View {
    @EnvironmentObject var gameViewModel: GameViewModel

    var player: Character? {
        gameViewModel.currentPlayer
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if let player = player {
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(player.name)
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)

                            HStack(spacing: 8) {
                                Badge(label: "Level \(player.level)", color: Color(red: 0.8, green: 0.2, blue: 0.8))
                                Badge(label: player.archetype.rawValue, color: Color(red: 0.3, green: 0.8, blue: 1))
                            }
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 4) {
                            Text("$\(player.money)")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(Color(red: 0.3, green: 1, blue: 0.5))

                            Text("Balance")
                                .font(.caption)
                                .foregroundColor(Color.white.opacity(0.6))
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(12)

                    VStack(spacing: 12) {
                        StatRow(label: "Health", value: "\(player.health)%", color: Color(red: 1, green: 0.3, blue: 0.3))
                        StatRow(label: "Stamina", value: "\(player.stamina)%", color: Color(red: 1, green: 0.8, blue: 0.2))
                        StatRow(label: "Reputation", value: "\(player.reputation)", color: Color(red: 0.3, green: 0.8, blue: 1))
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(12)

                    VStack(spacing: 8) {
                        HStack {
                            Text("Experience")
                                .font(.headline)
                                .foregroundColor(.white)

                            Spacer()

                            Text("\(player.experience) / \(player.experienceToNextLevel)")
                                .font(.caption)
                                .foregroundColor(Color.white.opacity(0.6))
                        }

                        ProgressView(value: player.experienceProgress)
                            .tint(Color(red: 0.8, green: 0.2, blue: 0.8))
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(12)

                    if gameViewModel.playerProgress.currentActiveJob == nil {
                        VStack(spacing: 12) {
                            HStack {
                                Image(systemName: "heart.fill")
                                    .foregroundColor(Color(red: 1, green: 0.3, blue: 0.3))
                                Text("Stamina Low?")
                                    .foregroundColor(.white)
                                Spacer()
                                Text("$100")
                                    .foregroundColor(Color(red: 0.3, green: 1, blue: 0.5))
                            }
                            .font(.headline)

                            Button(action: { gameViewModel.restoreStamina() }) {
                                Text("Restore at Rest Stop")
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(Color(red: 0.8, green: 0.2, blue: 0.8))
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                        }
                        .padding()
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(12)
                    }

                    VStack(spacing: 8) {
                        HStack {
                            Text("Statistics")
                                .font(.headline)
                                .foregroundColor(.white)
                            Spacer()
                        }

                        HStack(spacing: 12) {
                            StatCard(label: "Jobs", value: "\(gameViewModel.playerProgress.totalJobsCompleted)")
                            StatCard(label: "Earned", value: "$\(gameViewModel.playerProgress.totalMoneyEarned)")
                        }
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(12)
                }

                Spacer().frame(height: 20)
            }
            .padding()
        }
    }
}

struct StatRow: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(Color.white.opacity(0.7))

            Spacer()

            Text(value)
                .fontWeight(.semibold)
                .foregroundColor(color)
        }
    }
}

struct StatCard: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
                .foregroundColor(Color(red: 0.8, green: 0.2, blue: 0.8))

            Text(label)
                .font(.caption)
                .foregroundColor(Color.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.black.opacity(0.3))
        .cornerRadius(8)
    }
}

struct Badge: View {
    let label: String
    let color: Color

    var body: some View {
        Text(label)
            .font(.caption2)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.2))
            .foregroundColor(color)
            .cornerRadius(4)
    }
}

#Preview {
    MainTabView()
        .environmentObject(GameViewModel())
}
