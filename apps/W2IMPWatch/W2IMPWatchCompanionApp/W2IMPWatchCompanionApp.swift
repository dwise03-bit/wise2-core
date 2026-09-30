import SwiftUI

@main
struct W2IMPWatchCompanionApp: App {
    var body: some Scene {
        WindowGroup {
            VStack(spacing: 20) {
                Image(systemName: "applewatch")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)
                
                Text("W² IMP Watch")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Your watch app is installed.")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.gray)
                
                Button(action: {
                    if let url = URL(string: "watch://") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    Label("Open Watch App", systemImage: "applewatch")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
                .padding()
                
                Spacer()
            }
            .padding()
        }
    }
}
