import XCTest
@testable import WISE2

final class AuthNetworkingTests: XCTestCase {
  func testProductionDefaultWhenNoEnvOverride() {
    let resolved = APIConfiguration.resolvedBaseURLString()
    XCTAssertTrue(
      resolved.hasPrefix("https://wise2.net/api/v1"),
      "Expected production API default, got \(resolved)"
    )
  }

  func testEndpointURLJoinsNestedPaths() {
    let base = URL(string: "https://wise2.net/api/v1")!
    let url = APIConfiguration.endpointURL(base: base, path: "auth/login")
    XCTAssertEqual(url.absoluteString, "https://wise2.net/api/v1/auth/login")
  }

  func testLoginResponseDecodesNestAccessTokenShape() throws {
    let json = """
    {
      "accessToken": "jwt-access",
      "refreshToken": "jwt-refresh",
      "expiresIn": 900,
      "user": {
        "id": "user-1",
        "email": "owner@example.com",
        "name": "Daniel Wise",
        "role": "FOUNDER"
      }
    }
    """.data(using: .utf8)!

    struct AuthAPIResponse: Codable {
      let accessToken: String?
      let refreshToken: String?
      let token: String?
      let user: User?
      let data: AuthPayload?

      struct AuthPayload: Codable {
        let accessToken: String?
        let refreshToken: String?
        let user: User?
        let tokens: TokenPair?

        struct TokenPair: Codable {
          let accessToken: String?
          let refreshToken: String?
        }
      }

      func resolvedAuthResponse() throws -> AuthResponse {
        let payload = data
        let resolvedUser = payload?.user ?? user
        guard let resolvedUser else {
          throw NSError(domain: "test", code: 1)
        }
        let resolvedAccess = payload?.tokens?.accessToken
          ?? payload?.accessToken
          ?? accessToken
        return AuthResponse(
          token: resolvedAccess ?? "",
          refreshToken: payload?.refreshToken ?? refreshToken,
          user: resolvedUser
        )
      }
    }

    let decoded = try JSONDecoder().decode(AuthAPIResponse.self, from: json)
    let auth = try decoded.resolvedAuthResponse()
    XCTAssertEqual(auth.token, "jwt-access")
    XCTAssertEqual(auth.user.email, "owner@example.com")
    XCTAssertEqual(auth.user.role, "FOUNDER")
  }

  func testLoginResponseDecodesWebsiteWrappedShape() throws {
    let json = """
    {
      "success": true,
      "accessToken": "jwt-access",
      "refreshToken": "jwt-refresh",
      "user": {
        "id": "user-1",
        "email": "owner@example.com",
        "firstName": "Daniel",
        "lastName": "Wise",
        "role": "FOUNDER"
      }
    }
    """.data(using: .utf8)!

    struct AuthAPIResponse: Codable {
      let accessToken: String?
      let refreshToken: String?
      let user: User?
    }

    let decoded = try JSONDecoder().decode(AuthAPIResponse.self, from: json)
    XCTAssertEqual(decoded.accessToken, "jwt-access")
    XCTAssertEqual(decoded.user?.name, "Daniel Wise")
  }

  func testLocalhostDetection() {
    XCTAssertTrue(APIConfiguration.isLocalhost("http://localhost:3000/api/v1"))
    XCTAssertTrue(APIConfiguration.isLocalhost("http://127.0.0.1:3000/api/v1"))
    XCTAssertFalse(APIConfiguration.isLocalhost("https://wise2.net/api/v1"))
  }
}
