import SwiftUI

class GameViewModel: ObservableObject {
    @Published var currentPlayer: Character?
    @Published var availableJobs: [Job] = []
    @Published var playerProgress: UserProgress = UserProgress()
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let storageKey = "WISE2RP_Player"
    private let jobsStorageKey = "WISE2RP_Jobs"

    init() {
        loadPlayer()
        loadJobs()
    }

    func createCharacter(name: String, archetype: CharacterArchetype) {
        let character = Character(
            id: UUID().uuidString,
            name: name,
            archetype: archetype,
            money: archetype.startingBalance,
            createdAt: Date(),
            lastPlayedAt: Date()
        )
        currentPlayer = character
        playerProgress = UserProgress()
        savePlayer()
        unlockStarterJobs()
    }

    func unlockStarterJobs() {
        let starterJobs: [Job] = [
            Job(
                id: UUID().uuidString,
                title: "Deliver Packages",
                company: "FastShip Express",
                description: "Deliver packages across the city",
                payPerHour: 50,
                experienceReward: 100,
                difficultyLevel: 1,
                durationMinutes: 30,
                archetypesAllowed: CharacterArchetype.allCases
            ),
            Job(
                id: UUID().uuidString,
                title: "Stock Shelves",
                company: "MegaMart Retail",
                description: "Stock shelves and organize inventory",
                payPerHour: 40,
                experienceReward: 80,
                difficultyLevel: 1,
                durationMinutes: 30,
                archetypesAllowed: CharacterArchetype.allCases
            ),
            Job(
                id: UUID().uuidString,
                title: "Drive for Ride Share",
                company: "CityRide",
                description: "Pick up and drop off passengers",
                payPerHour: 60,
                experienceReward: 120,
                difficultyLevel: 2,
                durationMinutes: 45,
                archetypesAllowed: [.entrepreneur, .realtor, .streamer, .mechanic]
            ),
            Job(
                id: UUID().uuidString,
                title: "Security Guard",
                company: "SafeGuard Security",
                description: "Patrol and secure commercial properties",
                payPerHour: 55,
                experienceReward: 110,
                difficultyLevel: 2,
                durationMinutes: 45,
                archetypesAllowed: [.officer, .criminal, .firefighter]
            ),
            Job(
                id: UUID().uuidString,
                title: "Freelance Content Creator",
                company: "ContentHub",
                description: "Create and edit short-form videos",
                payPerHour: 75,
                experienceReward: 150,
                difficultyLevel: 3,
                durationMinutes: 60,
                archetypesAllowed: [.streamer, .entrepreneur]
            ),
        ]

        availableJobs = starterJobs
        saveJobs()

        if var player = currentPlayer {
            playerProgress.jobsUnlocked = starterJobs.map { $0.id }
            player.experience += 50
            currentPlayer = player
            savePlayer()
        }
    }

    func startJob(_ job: Job) {
        if var player = currentPlayer {
            playerProgress.currentActiveJob = job
            player.stamina = max(0, player.stamina - 20)
            currentPlayer = player
            savePlayer()
        }
    }

    func completeJob(_ job: Job) {
        guard var player = currentPlayer else { return }

        let pay = job.payPerHour
        let xp = job.experienceReward

        player.earnMoney(pay)
        player.addExperience(xp)
        player.stamina = min(100, player.stamina + 10)
        player.lastPlayedAt = Date()

        currentPlayer = player
        playerProgress.currentActiveJob = nil
        playerProgress.totalMoneyEarned += pay
        playerProgress.totalJobsCompleted += 1
        playerProgress.completedJobs.append(job.id)

        savePlayer()
        loadJobs()
    }

    func restoreStamina() {
        if var player = currentPlayer, player.spendMoney(100) {
            player.stamina = 100
            player.lastPlayedAt = Date()
            currentPlayer = player
            savePlayer()
        }
    }

    private func savePlayer() {
        if let player = currentPlayer {
            if let encoded = try? JSONEncoder().encode(player) {
                UserDefaults.standard.set(encoded, forKey: storageKey)
            }
        }
    }

    private func loadPlayer() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let player = try? JSONDecoder().decode(Character.self, from: data) {
            currentPlayer = player
        }
    }

    private func saveJobs() {
        if let encoded = try? JSONEncoder().encode(availableJobs) {
            UserDefaults.standard.set(encoded, forKey: jobsStorageKey)
        }
    }

    private func loadJobs() {
        if let data = UserDefaults.standard.data(forKey: jobsStorageKey),
           let jobs = try? JSONDecoder().decode([Job].self, from: data) {
            availableJobs = jobs
        }
    }

    func deleteCharacter() {
        currentPlayer = nil
        playerProgress = UserProgress()
        availableJobs = []
        UserDefaults.standard.removeObject(forKey: storageKey)
        UserDefaults.standard.removeObject(forKey: jobsStorageKey)
    }
}
