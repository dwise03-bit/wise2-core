import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = WatchViewModel()
    @State private var currentTime = Date()
    @Environment(\.accessibilityReduceMotion) var reduceMotion

    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var formattedTime: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: currentTime)
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: currentTime)
    }

    var body: some View {
        ZStack {
            // Background state image
            Image(viewModel.currentState.imageName)
                .resizable()
                .scaledToFill()
                .ignoresSafeArea()
                .transition(.opacity)

            // Content overlay
            VStack(spacing: 0) {
                // Top safe zone: Time and date
                VStack(spacing: 2) {
                    Text(formattedTime)
                        .font(.system(size: 18, weight: .semibold, design: .default))
                        .monospacedDigit()

                    Text(formattedDate)
                        .font(.system(size: 13, weight: .regular, design: .default))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.top, 8)
                .padding(.bottom, 4)

                Spacer()

                // Bottom safe zone: State label (hidden on always-on)
                if viewModel.currentState != .alwaysOn {
                    Text(viewModel.currentState.displayName)
                        .font(.system(size: 11, weight: .medium, design: .default))
                        .foregroundColor(.white.opacity(0.8))
                        .padding(.bottom, 6)
                }
            }
            .ignoresSafeArea(edges: .vertical)
        }
        .onTapGesture {
            if reduceMotion {
                viewModel.tapWatchFace()
            } else {
                withAnimation(.easeInOut(duration: 0.2)) {
                    viewModel.tapWatchFace()
                }
            }
        }
        .onReceive(timer) { _ in
            currentTime = Date()
        }
        // Development state picker - hidden in production
        #if DEBUG
        .sheet(isPresented: $viewModel.showingStatePicker) {
            StatePicker(viewModel: viewModel)
        }
        .onLongPressGesture {
            viewModel.showingStatePicker = true
        }
        #endif
    }
}

#if DEBUG
struct StatePicker: View {
    @ObservedObject var viewModel: WatchViewModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            List {
                ForEach(DisplayState.allCases, id: \.self) { state in
                    Button {
                        viewModel.setState(state)
                        dismiss()
                    } label: {
                        HStack {
                            Text(state.displayName)
                            Spacer()
                            if viewModel.currentState == state {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.blue)
                            }
                        }
                    }
                    .foregroundColor(.primary)
                }
            }
            .navigationTitle("Watch States")
        }
    }
}
#endif

#Preview {
    ContentView()
}
