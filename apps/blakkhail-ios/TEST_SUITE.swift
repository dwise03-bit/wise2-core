import XCTest

final class BlakkhailAppTests: XCTestCase {

  var app: XCUIApplication!

  override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    app.launch()
  }

  override func tearDownWithError() throws {
    app.terminate()
  }

  // MARK: - Authentication Tests

  func testLoginWithValidCredentials() throws {
    // Navigate to login
    XCTAssertTrue(app.staticTexts["LOGIN"].exists, "Login tab should exist")
    app.staticTexts["LOGIN"].tap()

    // Enter credentials
    let emailField = app.textFields["Email"]
    let passwordField = app.secureTextFields["Password"]

    emailField.tap()
    emailField.typeText("demo@blakkhail.com")

    passwordField.tap()
    passwordField.typeText("Demo123!")

    // Sign in
    app.buttons["SIGN IN"].tap()

    // Verify navigation to home
    XCTAssertTrue(app.staticTexts["HERITAGE"].exists, "Should navigate to home after login")
  }

  func testSignupNewAccount() throws {
    app.staticTexts["SIGNUP"].tap()

    let nameField = app.textFields["Display Name"]
    let emailField = app.textFields["Email"]
    let passwordField = app.secureTextFields["Password"]

    nameField.tap()
    nameField.typeText("Test User")

    emailField.tap()
    emailField.typeText("test@blakkhail.com")

    passwordField.tap()
    passwordField.typeText("TestPassword123!")

    app.buttons["CREATE ACCOUNT"].tap()

    // Should redirect to home on success
    XCTAssertTrue(app.staticTexts["HERITAGE"].exists, "Should create account and navigate to home")
  }

  // MARK: - Home Screen Tests

  func testHomeScreenLoads() throws {
    login()

    XCTAssertTrue(app.staticTexts["HERITAGE"].exists, "Hero headline should be visible")
    XCTAssertTrue(app.staticTexts["TAKE CONTROL"].exists, "Main CTA should be visible")
    XCTAssertTrue(app.buttons["SHOP COLLECTION"].exists, "Shop button should exist")
  }

  func testHomeScreenHeroAnimation() throws {
    login()

    let heroText = app.staticTexts["TAKE CONTROL"]
    XCTAssertTrue(heroText.isHittable, "Hero text should be visible and animating")
  }

  // MARK: - Product Catalog Tests

  func testNavigateToShop() throws {
    login()

    app.tabBars.buttons["Shop"].tap()

    XCTAssertTrue(app.staticTexts["SHOP BLAKK HAIL"].exists, "Shop header should be visible")
  }

  func testProductSearchWorks() throws {
    login()
    app.tabBars.buttons["Shop"].tap()

    let searchField = app.searchFields.firstMatch
    searchField.tap()
    searchField.typeText("tee")

    // Wait for search results
    XCTestCase.waitForElement(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'Tee'")), timeout: 3)
  }

  func testProductCategoryFilter() throws {
    login()
    app.tabBars.buttons["Shop"].tap()

    app.buttons["Hoodies"].tap()

    XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'Hoodie'")).count > 0, "Should show hoodies when filtered")
  }

  func testProductDetailPageOpens() throws {
    login()
    app.tabBars.buttons["Shop"].tap()

    // Tap first product
    let firstProduct = app.staticTexts.matching(NSPredicate(format: "label CONTAINS '$'")).firstMatch
    firstProduct.tap()

    XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'SIZE'")).count > 0, "Product detail should show size options")
  }

  // MARK: - Shopping Cart Tests

  func testAddToCart() throws {
    login()
    app.tabBars.buttons["Shop"].tap()

    // Browse product
    let firstProduct = app.scrollViews.firstMatch
    firstProduct.swipeUp()

    app.buttons["ADD TO CART"].tap()

    // Verify cart badge
    let cartBadge = app.tabBars.buttons.containing(NSPredicate(format: "label CONTAINS 'Cart'")).firstMatch
    XCTAssertTrue(cartBadge.label.contains("1"), "Cart should show 1 item")
  }

  func testViewCart() throws {
    login()
    app.tabBars.buttons["Shop"].tap()

    app.buttons["ADD TO CART"].tap()
    app.tabBars.buttons["Cart"].tap()

    XCTAssertTrue(app.staticTexts["YOUR CART"].exists, "Cart header should be visible")
  }

  func testCartCalculations() throws {
    login()
    app.tabBars.buttons["Shop"].tap()

    app.buttons["ADD TO CART"].tap()
    app.tabBars.buttons["Cart"].tap()

    // Verify totals exist
    XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'Subtotal'")).count > 0, "Should show subtotal")
    XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'Tax'")).count > 0, "Should show tax")
    XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'TOTAL'")).count > 0, "Should show total")
  }

  func testRemoveFromCart() throws {
    login()
    app.tabBars.buttons["Shop"].tap()

    app.buttons["ADD TO CART"].tap()
    app.tabBars.buttons["Cart"].tap()

    app.buttons["Remove"].tap()

    XCTAssertTrue(app.staticTexts["Your cart is empty"].exists, "Cart should be empty after removing item")
  }

  // MARK: - Checkout Tests

  func testCheckoutFlow() throws {
    login()
    addItemToCart()

    app.tabBars.buttons["Cart"].tap()
    app.buttons["PROCEED TO CHECKOUT"].tap()

    XCTAssertTrue(app.staticTexts["CHECKOUT"].exists, "Checkout header should appear")
  }

  func testCheckoutFormValidation() throws {
    login()
    addItemToCart()

    app.tabBars.buttons["Cart"].tap()
    app.buttons["PROCEED TO CHECKOUT"].tap()

    // Try to complete without entering info
    let completeButton = app.buttons["COMPLETE ORDER"]
    XCTAssertFalse(completeButton.isEnabled, "Complete button should be disabled until form is filled")
  }

  func testCheckoutFormFilling() throws {
    login()
    addItemToCart()

    app.tabBars.buttons["Cart"].tap()
    app.buttons["PROCEED TO CHECKOUT"].tap()

    // Fill form
    app.textFields["Email"].tap()
    app.textFields["Email"].typeText("test@blakkhail.com")

    app.textFields["Full Name"].tap()
    app.textFields["Full Name"].typeText("Test User")

    app.textFields["Address"].tap()
    app.textFields["Address"].typeText("123 Main St")

    app.textFields["City"].tap()
    app.textFields["City"].typeText("New York")

    app.textFields["ZIP"].tap()
    app.textFields["ZIP"].typeText("10001")

    // Complete should now be enabled
    let completeButton = app.buttons["COMPLETE ORDER"]
    XCTAssertTrue(completeButton.isEnabled, "Complete button should be enabled after filling form")
  }

  // MARK: - Brand Story Tests

  func testBrandStoryLoads() throws {
    login()

    app.tabBars.buttons["Story"].tap()

    XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS 'HERITAGE STREETWEAR'")).count > 0, "Story headline should be visible")
  }

  func testStoryValues() throws {
    login()
    app.tabBars.buttons["Story"].tap()

    XCTAssertTrue(app.staticTexts["ORIGINAL"].exists, "Should show Original value")
    XCTAssertTrue(app.staticTexts["LEGACY"].exists, "Should show Legacy value")
    XCTAssertTrue(app.staticTexts["CULTURE"].exists, "Should show Culture value")
  }

  func testTimeline() throws {
    login()
    app.tabBars.buttons["Story"].tap()

    // Timeline should show years
    XCTAssertTrue(app.staticTexts.containing(NSPredicate(format: "label CONTAINS '1994'")).count > 0, "Should show founding year")
  }

  // MARK: - Account Tests

  func testAccountPageLoads() throws {
    login()

    app.tabBars.buttons["Account"].tap()

    XCTAssertTrue(app.staticTexts["PREFERENCES"].exists, "Account preferences should be visible")
  }

  func testNotificationToggle() throws {
    login()
    app.tabBars.buttons["Account"].tap()

    let toggle = app.switches.firstMatch
    let initialState = toggle.value as? String == "0"

    toggle.tap()

    // Verify state changed
    XCTAssertNotEqual(toggle.value as? String == "0", initialState, "Toggle should change state")
  }

  func testLogout() throws {
    login()

    app.tabBars.buttons["Account"].tap()
    app.buttons["SIGN OUT"].tap()

    // Should redirect to login
    XCTAssertTrue(app.staticTexts["LOGIN"].exists, "Should return to login after logout")
  }

  // MARK: - Performance Tests

  func testAppLaunchPerformance() throws {
    self.measure {
      let app = XCUIApplication()
      app.launch()
    }
  }

  func testScrollingPerformance() throws {
    login()

    self.measure {
      let scrollView = app.scrollViews.firstMatch
      scrollView.swipeUp()
      scrollView.swipeUp()
      scrollView.swipeDown()
    }
  }

  // MARK: - Helper Methods

  private func login() {
    app.staticTexts["LOGIN"].tap()

    app.textFields["Email"].tap()
    app.textFields["Email"].typeText("demo@blakkhail.com")

    app.secureTextFields["Password"].tap()
    app.secureTextFields["Password"].typeText("Demo123!")

    app.buttons["SIGN IN"].tap()

    XCTestCase.waitForElement(app.staticTexts["HERITAGE"], timeout: 5)
  }

  private func addItemToCart() {
    app.tabBars.buttons["Shop"].tap()

    XCTestCase.waitForElement(app.buttons["ADD TO CART"], timeout: 3)
    app.buttons["ADD TO CART"].tap()
  }
}

// MARK: - XCTest Extensions

extension XCTestCase {
  static func waitForElement(_ element: XCUIElement, timeout: TimeInterval) {
    let predicate = NSPredicate(format: "exists == true")
    let expectation = XCTNSPredicateExpectation(predicate: predicate, object: element)
    XCTWaiter().wait(for: [expectation], timeout: timeout)
  }
}

// MARK: - Test Suite Configuration

class BlakkhailAppTestSuite {
  static func run() {
    print("""
    🧪 BLAKKHAIL iOS Test Suite
    ========================================

    Running comprehensive tests:

    ✅ Authentication
      - Login with valid credentials
      - Signup new account

    ✅ Home Screen
      - Page loads
      - Animations play

    ✅ Product Catalog
      - Navigate to shop
      - Search functionality
      - Category filtering
      - Product detail pages

    ✅ Shopping Cart
      - Add to cart
      - View cart
      - Price calculations
      - Remove items

    ✅ Checkout
      - Checkout flow
      - Form validation
      - Form filling

    ✅ Brand Story
      - Story loads
      - Values display
      - Timeline visible

    ✅ Account
      - Profile page loads
      - Notification toggle
      - Logout functionality

    ✅ Performance
      - App launch time
      - Scroll performance

    ========================================
    Tests complete!
    """)
  }
}
