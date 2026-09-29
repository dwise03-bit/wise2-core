import LocalAuthentication

protocol SensitiveActionAuthorizing {
  func authorize(reason: String) async -> Bool
}

struct SensitiveActionAuthorizer: SensitiveActionAuthorizing {
  func authorize(reason: String) async -> Bool {
    await withCheckedContinuation { continuation in
      let context = LAContext()
      var error: NSError?
      guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        continuation.resume(returning: false)
        return
      }
      context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in
        continuation.resume(returning: success)
      }
    }
  }
}

struct PreviewSensitiveActionAuthorizer: SensitiveActionAuthorizing {
  var shouldAuthorize = true
  func authorize(reason: String) async -> Bool { shouldAuthorize }
}
