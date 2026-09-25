import SwiftUI

struct PhoneServiceView: View {
  @StateObject private var serviceManager = PhoneServiceManager()
  @State private var selectedPlan = PhonePlan.starter

  var body: some View {
    ZStack {
      Color.blakkhailNavy.ignoresSafeArea()

      VStack(spacing: 0) {
        VStack(spacing: 8) {
          Text("PHONE SERVICE")
            .font(.system(size: 24, weight: .black))
            .foregroundColor(.blakkhailGold)
            .tracking(1.2)
          Text("Business-grade connectivity")
            .font(.system(size: 12, weight: .light))
            .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(Color.black.opacity(0.3))

        ScrollView {
          VStack(spacing: 20) {
            // Plans
            VStack(alignment: .leading, spacing: 12) {
              Text("CHOOSE PLAN")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailCyan)
                .tracking(0.8)

              VStack(spacing: 12) {
                ForEach(PhonePlan.allCases, id: \.self) { plan in
                  PlanCard(
                    plan: plan,
                    isSelected: selectedPlan == plan,
                    onSelect: { selectedPlan = plan }
                  )
                }
              }
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Features
            VStack(alignment: .leading, spacing: 12) {
              Text("PLAN FEATURES")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailGold)
                .tracking(0.8)

              VStack(alignment: .leading, spacing: 10) {
                FeatureRow(icon: "phone.fill", text: "Unlimited Voice Calls")
                FeatureRow(icon: "message.fill", text: "Unlimited SMS/MMS")
                FeatureRow(icon: "network", text: "LTE/5G Coverage")
                FeatureRow(icon: "globe", text: "International Roaming")
                FeatureRow(icon: "lock.fill", text: "Business Security")
              }
              .padding(12)
              .background(Color.black.opacity(0.3))
              .cornerRadius(6)
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Quick Stats
            VStack(alignment: .leading, spacing: 12) {
              Text("ACCOUNT STATS")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.blakkhailGold)
                .tracking(0.8)

              VStack(spacing: 10) {
                StatRow(label: "Monthly Cost", value: selectedPlan.price)
                StatRow(label: "Data Included", value: selectedPlan.data)
                StatRow(label: "Contract", value: selectedPlan.contract)
              }
              .padding(12)
              .background(Color.black.opacity(0.3))
              .cornerRadius(6)
            }
            .padding(16)
            .background(Color.black.opacity(0.2))
            .cornerRadius(8)

            // Action
            Button(action: { Task { await serviceManager.activatePlan(selectedPlan) } }) {
              HStack {
                Image(systemName: "checkmark.circle.fill")
                Text("ACTIVATE \(selectedPlan.name)")
                  .font(.system(size: 14, weight: .bold))
              }
              .frame(maxWidth: .infinity)
              .padding(14)
              .background(LinearGradient(
                gradient: Gradient(colors: [.blakkhailGold, Color(red: 0.65, green: 0.52, blue: 0.28)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
              ))
              .foregroundColor(.blakkhailNavy)
              .cornerRadius(6)
            }
            .padding(16)
          }
        }
      }
    }
  }
}

struct PlanCard: View {
  let plan: PhonePlan
  let isSelected: Bool
  let onSelect: () -> Void

  var body: some View {
    Button(action: onSelect) {
      VStack(alignment: .leading, spacing: 8) {
        HStack {
          VStack(alignment: .leading, spacing: 4) {
            Text(plan.name)
              .font(.system(size: 14, weight: .bold))
              .foregroundColor(.white)
            Text(plan.price)
              .font(.system(size: 13, weight: .semibold))
              .foregroundColor(.blakkhailGold)
          }
          Spacer()
          if isSelected {
            Image(systemName: "checkmark.circle.fill")
              .foregroundColor(.blakkhailCyan)
              .font(.system(size: 18))
          }
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(12)
      .background(isSelected ? Color.blakkhailGold.opacity(0.15) : Color.black.opacity(0.2))
      .cornerRadius(6)
    }
  }
}

struct FeatureRow: View {
  let icon: String
  let text: String

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: icon)
        .font(.system(size: 14, weight: .semibold))
        .foregroundColor(.blakkhailCyan)
        .frame(width: 20)
      Text(text)
        .font(.system(size: 13, weight: .regular))
        .foregroundColor(.white)
      Spacer()
    }
  }
}

struct StatRow: View {
  let label: String
  let value: String

  var body: some View {
    HStack {
      Text(label)
        .font(.system(size: 12, weight: .regular))
        .foregroundColor(.gray)
      Spacer()
      Text(value)
        .font(.system(size: 13, weight: .semibold))
        .foregroundColor(.blakkhailCyan)
    }
  }
}

enum PhonePlan: String, CaseIterable, Hashable {
  case starter
  case professional
  case enterprise

  var name: String {
    switch self {
    case .starter: return "Starter"
    case .professional: return "Professional"
    case .enterprise: return "Enterprise"
    }
  }

  var price: String {
    switch self {
    case .starter: return "$29/mo"
    case .professional: return "$59/mo"
    case .enterprise: return "Custom"
    }
  }

  var data: String {
    switch self {
    case .starter: return "10GB"
    case .professional: return "50GB"
    case .enterprise: return "Unlimited"
    }
  }

  var contract: String {
    switch self {
    case .starter: return "Month-to-month"
    case .professional: return "Annual"
    case .enterprise: return "Custom"
    }
  }
}

@MainActor
class PhoneServiceManager: ObservableObject {
  @Published var isActivating = false

  func activatePlan(_ plan: PhonePlan) async {
    isActivating = true
    defer { isActivating = false }

    print("✅ Activated \(plan.name) plan")
    await Task.sleep(500_000_000)
  }
}

#Preview {
  PhoneServiceView()
    .preferredColorScheme(.dark)
}
