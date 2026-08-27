import Foundation
import Security

class KeychainManager {
  private let service = "com.wise2.app"
  private let account = "authToken"

  // MARK: - Token Storage

  func saveToken(_ token: String) throws {
    let data = token.data(using: .utf8)!

    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecValueData as String: data,
      kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    ]

    // Try to delete existing first
    SecItemDelete(query as CFDictionary)

    // Then add new
    let status = SecItemAdd(query as CFDictionary, nil)
    guard status == errSecSuccess else {
      throw KeychainError.saveFailed(status)
    }

    print("✅ Token saved to Keychain")
  }

  func getToken() throws -> String {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecReturnData as String: true,
    ]

    var result: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &result)

    guard status == errSecSuccess,
          let data = result as? Data,
          let token = String(data: data, encoding: .utf8)
    else {
      throw KeychainError.retrieveFailed(status)
    }

    return token
  }

  func deleteToken() throws {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
    ]

    let status = SecItemDelete(query as CFDictionary)
    guard status == errSecSuccess || status == errSecItemNotFound else {
      throw KeychainError.deleteFailed(status)
    }

    print("✅ Token deleted from Keychain")
  }
}

// MARK: - Error Handling

enum KeychainError: LocalizedError {
  case saveFailed(OSStatus)
  case retrieveFailed(OSStatus)
  case deleteFailed(OSStatus)

  var errorDescription: String? {
    switch self {
    case .saveFailed:
      return "Failed to save token to Keychain"
    case .retrieveFailed:
      return "Failed to retrieve token from Keychain"
    case .deleteFailed:
      return "Failed to delete token from Keychain"
    }
  }
}
