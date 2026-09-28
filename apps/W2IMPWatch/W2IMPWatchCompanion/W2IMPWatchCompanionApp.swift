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
                
                Text("Your watch app is installed. Open the Watch app to launch it.")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.gray)
                    .padding()
                
                Spacer()
            }
            .padding()
        }
    }
}
