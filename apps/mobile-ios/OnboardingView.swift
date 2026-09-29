import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var gameViewModel: GameViewModel
    @State private var currentStep = 0
    @State private var characterName = ""
    @State private var selectedArchetype: CharacterArchetype = .entrepreneur

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
                if currentStep == 0 {
                    WelcomeStepView()
                } else if currentStep == 1 {
                    NameStepView(name: $characterName)
                } else {
                    ArchetypeStepView(archetype: $selectedArchetype)
                }

                Spacer()

                HStack(spacing: 12) {
                    if currentStep > 0 {
                        Button(action: { currentStep -= 1 }) {
                            Text("Back")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Color.gray.opacity(0.3))
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                    }

                    Button(action: {
                        if currentStep < 2 {
                            currentStep += 1
                        } else {
                            gameViewModel.createCharacter(
                                name: characterName.isEmpty ? "Player" : characterName,
                                archetype: selectedArchetype
                            )
                        }
                    }) {
                        Text(currentStep < 2 ? "Next" : "Create Character")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color(red: 0.8, green: 0.2, blue: 0.8))
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    .disabled(currentStep == 1 && characterName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding()
            }
        }
    }
}

struct WelcomeStepView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 12) {
                Text("WISE² RP")
                    .font(.system(size: 48, weight: .bold, design: .default))
                    .foregroundColor(Color(red: 1, green: 0.3, blue: 0.8))

                Text("THE CITY NEVER SLEEPS")
                    .font(.system(size: 14, weight: .semibold, design: .default))
                    .tracking(2)
                    .foregroundColor(Color(red: 0.7, green: 0.7, blue: 0.9))
            }

            VStack(spacing: 12) {
                Text("Welcome to the Living City Ecosystem")
                    .font(.headline)
                    .foregroundColor(.white)

                Text("Build your legacy through discovery, growth, and endless possibilities. Every choice matters. Every action counts.")
                    .font(.body)
                    .foregroundColor(Color.white.opacity(0.8))
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal)

            Spacer()
        }
    }
}

struct NameStepView: View {
    @Binding var name: String

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 12) {
                Text("What's Your Name?")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)

                Text("This is how others will know you in the city")
                    .font(.body)
                    .foregroundColor(Color.white.opacity(0.7))
            }

            TextField("Enter your name", text: $name)
                .padding()
                .background(Color.white.opacity(0.1))
                .cornerRadius(8)
                .foregroundColor(.white)
                .accentColor(Color(red: 0.8, green: 0.2, blue: 0.8))

            Spacer()
        }
        .padding()
    }
}

struct ArchetypeStepView: View {
    @Binding var archetype: CharacterArchetype

    var body: some View {
        VStack(spacing: 20) {
            Text("Choose Your Path")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)

            ScrollView {
                VStack(spacing: 12) {
                    ForEach(CharacterArchetype.allCases, id: \.self) { option in
                        ArchetypeCard(
                            archetype: option,
                            isSelected: archetype == option,
                            action: { archetype = option }
                        )
                    }
                }
                .padding()
            }

            Spacer()
        }
    }
}

struct ArchetypeCard: View {
    let archetype: CharacterArchetype
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(archetype.rawValue)
                            .font(.headline)
                            .foregroundColor(.white)

                        Text(archetype.description)
                            .font(.caption)
                            .foregroundColor(Color.white.opacity(0.7))
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Start: $\(archetype.startingBalance)")
                            .font(.caption2)
                            .foregroundColor(Color(red: 0.3, green: 1, blue: 0.5))
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(
                    isSelected
                        ? Color(red: 0.8, green: 0.2, blue: 0.8).opacity(0.3)
                        : Color.white.opacity(0.05)
                )
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(
                            isSelected
                                ? Color(red: 0.8, green: 0.2, blue: 0.8)
                                : Color.white.opacity(0.2),
                            lineWidth: 2
                        )
                )
            }
        }
    }
}

#Preview {
    OnboardingView()
        .environmentObject(GameViewModel())
}
