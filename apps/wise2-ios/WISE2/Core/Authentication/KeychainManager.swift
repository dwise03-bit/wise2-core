import Foundation
import Security

class KeychainManager {
  private let service = "com.wise2.app"
  private let accessAccount = "authToken"
  private let refreshAccount = "refreshToken"

  // MARK: - Access Token

  func saveToken(_ token: String) throws {
    try save(token, account: accessAccount)
  }

  func getToken() throws -> String {
    try load(account: accessAccount)
  }

  func deleteToken() throws {
    try delete(account: accessAccount)
    try? delete(account: refreshAccount)
  }

  // MARK: - Refresh Token

  func saveRefreshToken(_ token: String) throws {
    try save(token, account: refreshAccount)
  }

  func getRefreshToken() throws -> String {
    try load(account: refreshAccount)
  }

  // MARK: - Keychain primitives

  private func save(_ value: String, account: String) throws {
    let data = Data(value.utf8)
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecValueData as String: data,
      kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    ]
    SecItemDelete(query as CFDictionary)
    let status = SecItemAdd(query as CFDictionary, nil)
    guard status == errSecSuccess else {
      throw KeychainError.saveFailed(status)
    }
  }

  private func load(account: String) throws -> String {
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

  private func delete(account: String) throws {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
    ]
    let status = SecItemDelete(query as CFDictionary)
    guard status == errSecSuccess || status == errSecItemNotFound else {
      throw KeychainError.deleteFailed(status)
    }
  }
}

enum KeychainError: LocalizedError {
  case saveFailed(OSStatus)
  case retrieveFailed(OSStatus)
  case deleteFailed(OSStatus)

  var errorDescription: String? {
    switch self {
    case .saveFailed: return "Failed to save token to Keychain"
    case .retrieveFailed: return "Failed to retrieve token from Keychain"
    case .deleteFailed: return "Failed to delete token from Keychain"
    }
  }
}
