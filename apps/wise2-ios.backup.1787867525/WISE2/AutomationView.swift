import SwiftUI

struct AutomationView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 16) {
                Text("Automations")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(appState.automations, id: \.id) { automation in
                            AutomationCardView(automation: automation)
                        }

                        if appState.automations.isEmpty {
                            Text("No automations configured")
                                .foregroundColor(.gray)
                                .padding(32)
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

struct AutomationCardView: View {
    let automation: Automation
    @EnvironmentObject var appState: AppState
    @State private var isExecuting = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(automation.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)

                    if let description = automation.description {
                        Text(description)
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                            .lineLimit(2)
                    }
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text(automation.enabled ? "Active" : "Disabled")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(automation.enabled ? .green : .gray)
                    Circle()
                        .fill(automation.enabled ? Color.green : Color.gray)
                        .frame(width: 8, height: 8)
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                if !automation.triggers.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Triggers")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                        ForEach(automation.triggers, id: \.type) { trigger in
                            HStack {
                                Text("•")
                                Text(trigger.type)
                            }
                            .font(.system(size: 12))
                            .foregroundColor(.cyan)
                        }
                    }
                }

                if !automation.actions.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Actions")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                        ForEach(automation.actions, id: \.type) { action in
                            HStack {
                                Text("•")
                                Text(action.type)
                            }
                            .font(.system(size: 12))
                            .foregroundColor(.pink)
                        }
                    }
                }
            }

            Button(action: {
                Task {
                    isExecuting = true
                    await appState.executeAutomation(automation.id)
                    isExecuting = false
                }
            }) {
                HStack {
                    if isExecuting {
                        ProgressView()
                            .tint(.cyan)
                    }
                    Text(isExecuting ? "Executing..." : "Execute")
                }
                .frame(maxWidth: .infinity)
                .padding(10)
                .background(Color.cyan.opacity(0.2))
                .foregroundColor(.cyan)
                .border(Color.cyan, width: 1)
            }
            .disabled(isExecuting || !automation.enabled)
        }
        .padding(12)
        .background(Color.gray.opacity(0.08))
        .border(Color.cyan.opacity(0.2), width: 1)
        .cornerRadius(4)
    }
}

#Preview {
    AutomationView()
        .environmentObject(AppState())
}
