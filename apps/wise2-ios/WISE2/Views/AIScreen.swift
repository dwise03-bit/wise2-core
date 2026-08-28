import LocalAuthentication
import SwiftUI

struct AIScreen: View {
  @StateObject private var viewModel = AIScreenViewModel()
  @EnvironmentObject var authManager: AuthManager
  let selectedBusiness: String

  var body: some View {
    ZStack {
      Color.wise2Background.ignoresSafeArea()

      VStack(spacing: 0) {
        header
        timeline
      }
    }
    .safeAreaInset(edge: .bottom) {
      composer
        .background(Color.wise2Background)
    }
    .toolbar(.hidden, for: .navigationBar)
  }

  private var header: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text("WISE² AI")
            .font(.system(.largeTitle, design: .rounded, weight: .bold))
            .foregroundColor(.wise2TextPrimary)
          Text(selectedBusiness)
            .font(.caption.weight(.semibold))
            .foregroundColor(.wise2Primary)
        }
        Spacer()
        NavigationLink {
          DetailScreen(title: "AI Action History", rows: viewModel.auditRows)
        } label: {
          Image(systemName: "clock.arrow.circlepath")
            .frame(width: 44, height: 44)
            .foregroundColor(.wise2TextPrimary)
        }
        .accessibilityLabel("AI action history")
      }

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 8) {
          ForEach(viewModel.suggestedCommands, id: \.self) { command in
            Button(command) {
              viewModel.inputText = command
            }
            .font(.caption.weight(.semibold))
            .foregroundColor(.wise2TextPrimary)
            .padding(.vertical, 9)
            .padding(.horizontal, 11)
            .background(Color.wise2SurfaceSecondary)
            .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
          }
        }
      }
    }
    .padding(.horizontal, 18)
    .padding(.top, 12)
    .padding(.bottom, 10)
  }

  private var timeline: some View {
    ScrollViewReader { proxy in
      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 14) {
          if viewModel.messages.isEmpty {
            CommandCard {
              Text("Command surface ready")
                .font(.headline)
                .foregroundColor(.wise2TextPrimary)
              Text("Ask for a briefing, draft a follow-up, inspect operations, or prepare a change for approval.")
                .font(.subheadline)
                .foregroundColor(.wise2TextSecondary)
              SafetyLegend()
            }
          }

          ForEach(viewModel.messages) { message in
            ChatBubble(message: message)
              .id(message.id)
          }

          if let proposedAction = viewModel.proposedAction {
            ApprovalCard(action: proposedAction) {
              Task { await viewModel.approveProposedAction() }
            } reject: {
              viewModel.rejectProposedAction()
            } confirmFaceID: {
              await viewModel.confirmCriticalActionWithFaceID()
            }
            .id("approval-card")
          }

          if viewModel.isLoading {
            CommandCard {
              HStack(spacing: 10) {
                ProgressView()
                  .tint(.wise2Primary)
                VStack(alignment: .leading, spacing: 3) {
                  Text("Executing read request")
                    .foregroundColor(.wise2TextPrimary)
                  Text("Waiting for backend confirmation before reporting success.")
                    .font(.caption)
                    .foregroundColor(.wise2TextMuted)
                }
              }
            }
          }

          if let error = viewModel.errorMessage {
            CommandCard {
              Label(error, systemImage: "exclamationmark.triangle.fill")
                .foregroundColor(.wise2Danger)
              Text("Safest recovery: check connection and retry the request. No mutation was queued.")
                .font(.caption)
                .foregroundColor(.wise2TextSecondary)
            }
          }
        }
        .padding(.horizontal, 18)
        .padding(.top, 6)
        .padding(.bottom, 14)
        .onChange(of: viewModel.messages.count) { _ in
          if let lastMessage = viewModel.messages.last {
            withAnimation(.easeOut(duration: 0.2)) {
              proxy.scrollTo(lastMessage.id, anchor: .bottom)
            }
          }
        }
      }
    }
  }

  private var composer: some View {
    VStack(spacing: 10) {
      HStack(spacing: 10) {
        Button {
          viewModel.inputText = "Start voice command"
        } label: {
          Image(systemName: "mic.fill")
            .frame(width: 44, height: 44)
            .foregroundColor(.wise2Primary)
            .background(Color.wise2Surface)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        }
        .accessibilityLabel("Voice command")

        TextField("Ask WISE²...", text: $viewModel.inputText, axis: .vertical)
          .lineLimit(1...4)
          .textInputAutocapitalization(.sentences)
          .padding(.vertical, 12)
          .padding(.horizontal, 12)
          .foregroundColor(.wise2TextPrimary)
          .background(Color.wise2Surface)
          .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
          .accessibilityIdentifier("ai-composer")

        Button {
          Task { await viewModel.sendMessage(scope: selectedBusiness) }
        } label: {
          Image(systemName: "arrow.up.circle.fill")
            .font(.system(size: 28))
            .foregroundColor(viewModel.canSend ? .wise2Primary : .wise2TextMuted)
            .frame(width: 44, height: 44)
        }
        .disabled(!viewModel.canSend || viewModel.isLoading)
        .accessibilityLabel("Send AI message")
      }
    }
    .padding(.horizontal, 14)
    .padding(.top, 10)
    .padding(.bottom, 8)
    .overlay(Rectangle().fill(Color.wise2BorderSubtle).frame(height: 1), alignment: .top)
  }
}

struct SafetyLegend: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 7) {
      Label("Level 1 Read: runs when authorized", systemImage: "eye.fill")
      Label("Level 2 Modify: exact preview requires approval", systemImage: "pencil.and.list.clipboard")
      Label("Level 3 Critical: approval plus Face ID", systemImage: "faceid")
    }
    .font(.caption)
    .foregroundColor(.wise2TextSecondary)
  }
}

struct ApprovalCard: View {
  let action: AIProposedAction
  let approve: () -> Void
  let reject: () -> Void
  let confirmFaceID: () async -> Bool
  @State private var faceIDPassed = false

  var body: some View {
    CommandCard {
      HStack {
        VStack(alignment: .leading, spacing: 4) {
          Text("Approval Required")
            .font(.headline)
            .foregroundColor(.wise2TextPrimary)
          Text(action.level)
            .font(.caption.weight(.semibold))
            .foregroundColor(action.isCritical ? .wise2Danger : .wise2Warning)
        }
        Spacer()
        Image(systemName: action.isCritical ? "faceid" : "checkmark.shield.fill")
          .foregroundColor(action.isCritical ? .wise2Danger : .wise2Warning)
      }

      Text(action.title)
        .font(.subheadline.weight(.semibold))
        .foregroundColor(.wise2TextPrimary)
      Text(action.exactMutation)
        .font(.caption)
        .foregroundColor(.wise2TextSecondary)
      NavigationLink {
        DetailScreen(title: "Audit Preview", rows: action.auditRows)
      } label: {
        Label("Review audit record", systemImage: "doc.text.magnifyingglass")
          .font(.caption.weight(.semibold))
      }
      .foregroundColor(.wise2Primary)

      HStack(spacing: 10) {
        Button("Reject", role: .destructive, action: reject)
          .buttonStyle(.bordered)
        Button(action.isCritical && !faceIDPassed ? "Confirm Face ID" : "Approve") {
          if action.isCritical && !faceIDPassed {
            Task { faceIDPassed = await confirmFaceID() }
          } else {
            approve()
          }
        }
        .buttonStyle(.borderedProminent)
        .tint(action.isCritical && !faceIDPassed ? .wise2Danger : .wise2Primary)
      }
    }
  }
}

struct ChatBubble: View {
  let message: ChatMessage

  var body: some View {
    HStack(alignment: .top, spacing: 10) {
      if message.role == .assistant {
        Image(systemName: "sparkles")
          .foregroundColor(.wise2Primary)
          .frame(width: 24)
      }
      VStack(alignment: .leading, spacing: 6) {
        Text(message.content)
          .font(.body)
          .foregroundColor(message.role == .user ? .white : .wise2TextPrimary)
          .textSelection(.enabled)
        if let source = message.source {
          Text(source)
            .font(.caption)
            .foregroundColor(.wise2TextMuted)
        }
        Text(message.timestamp.formatted(date: .omitted, time: .shortened))
          .font(.caption2)
          .foregroundColor(.wise2TextMuted)
      }
      .padding(12)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(message.role == .user ? Color.wise2Primary.opacity(0.8) : Color.wise2Surface)
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

      if message.role == .user {
        Image(systemName: "person.crop.circle.fill")
          .foregroundColor(.wise2TextMuted)
          .frame(width: 24)
      }
    }
  }
}

#Preview {
  AIScreen(selectedBusiness: "ALL BUSINESSES")
    .environmentObject(AuthManager())
}
