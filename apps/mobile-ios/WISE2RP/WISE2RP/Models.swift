import Foundation

enum CharacterArchetype: String, CaseIterable, Codable {
    case entrepreneur = "Entrepreneur"
    case criminal = "Criminal"
    case officer = "Officer"
    case paramedic = "Paramedic"
    case firefighter = "Firefighter"
    case realtor = "Realtor"
    case mechanic = "Mechanic"
    case streamer = "Streamer"

    var description: String {
        switch self {
        case .entrepreneur:
            return "Build wealth through legitimate business"
        case .criminal:
            return "Take risks for high rewards"
        case .officer:
            return "Enforce the law and protect citizens"
        case .paramedic:
            return "Save lives in medical emergencies"
        case .firefighter:
            return "Fight fires and rescue operations"
        case .realtor:
            return "Sell property and build real estate empire"
        case .mechanic:
            return "Fix cars and run a garage"
        case .streamer:
            return "Build audience and monetize content"
        }
    }

    var startingBalance: Int {
        switch self {
        case .entrepreneur, .realtor, .streamer:
            return 5000
        case .criminal:
            return 2000
        default:
            return 3000
        }
    }
}

struct Character: Codable, Identifiable {
    let id: String
    var name: String
    var archetype: CharacterArchetype
    var level: Int = 1
    var experience: Int = 0
    var money: Int
    var health: Int = 100
    var stamina: Int = 100
    var reputation: Int = 0
    var createdAt: Date
    var lastPlayedAt: Date

    var experienceToNextLevel: Int {
        level * 500
    }

    var experienceProgress: Double {
        Double(experience) / Double(experienceToNextLevel)
    }

    mutating func addExperience(_ amount: Int) {
        experience += amount
        while experience >= experienceToNextLevel {
            levelUp()
        }
    }

    mutating func levelUp() {
        experience -= experienceToNextLevel
        level += 1
        health = 100
        stamina = 100
    }

    mutating func earnMoney(_ amount: Int) {
        money += amount
    }

    mutating func spendMoney(_ amount: Int) -> Bool {
        if money >= amount {
            money -= amount
            return true
        }
        return false
    }
}

struct Job: Codable, Identifiable {
    let id: String
    var title: String
    var company: String
    var description: String
    var payPerHour: Int
    var experienceReward: Int
    var difficultyLevel: Int
    var durationMinutes: Int
    var archetypesAllowed: [CharacterArchetype]

    var isEarned: Bool {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        return lastEarnedDate != nil && calendar.startOfDay(for: lastEarnedDate!) == today
    }

    var lastEarnedDate: Date?
}

struct UserProgress: Codable {
    var totalMoneyEarned: Int = 0
    var totalJobsCompleted: Int = 0
    var currentActiveJob: Job?
    var jobsUnlocked: [String] = []
    var completedJobs: [String] = []
    var stats: [String: Int] = [:]
}
