# WISE² Authentication - Comprehensive Test Suite

**Purpose:** End-to-end testing of all authentication flows with cURL examples and expected responses.

**Environment:** 
- Development: `http://localhost:3010`
- Production: `https://api.wise2.net`

---

## Test Preparation

### Setup Test User
```bash
# Create a test user for authentication testing
# Run this once at the start of testing

TEST_EMAIL="auth-test-$(date +%s)@example.com"
TEST_PASSWORD="Test@1234!Secure"

echo "Test Email: $TEST_EMAIL"
echo "Test Password: $TEST_PASSWORD"

# Save for use in tests
export TEST_EMAIL
export TEST_PASSWORD
export BASE_URL="http://localhost:3010"
```

### Database Cleanup (Optional)
```bash
# To reset test data between test runs:
# psql -h localhost -U postgres -d wise2_core -c \
#   "DELETE FROM users WHERE email LIKE 'auth-test-%@example.com';"
```

---

## Test Suite: Complete Authentication Flows

### Test Flow 1: Signup → Email Verification → Login → Token Refresh → Logout

#### 1.1 Signup (Positive Case)
**Endpoint:** `POST /v1/auth/signup`  
**Expected Status:** 201

```bash
curl -X POST $BASE_URL/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "firstName": "Auth",
    "lastName": "Test"
  }' | jq .
```

**Expected Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "auth-test-1721161234@example.com",
    "firstName": "Auth",
    "lastName": "Test"
  },
  "message": "Signup successful. Check your email to verify your account."
}
```

**Verification:**
- ✅ Status 201 Created
- ✅ User object returned (no password_hash)
- ✅ Confirmation message provided
- ✅ Database has user with email_verified = false

---

#### 1.2 Signup Error: Email Already Exists
**Endpoint:** `POST /v1/auth/signup`  
**Expected Status:** 409

```bash
# Try to signup with same email
curl -X POST $BASE_URL/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 409,
  "message": "Email address is already registered",
  "error": "Conflict"
}
```

**Verification:**
- ✅ Status 409 Conflict
- ✅ Clear error message
- ✅ No password hash exposed

---

#### 1.3 Signup Error: Weak Password
**Endpoint:** `POST /v1/auth/signup`  
**Expected Status:** 400

```bash
curl -X POST $BASE_URL/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak-pass@example.com",
    "password": "weak"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Password must be at least 8 characters long",
  "error": "Bad Request"
}
```

**Verification:**
- ✅ Status 400 Bad Request
- ✅ Clear error message about requirement
- ✅ User not created in database

---

#### 1.4 Verify Email
**Endpoint:** `POST /v1/auth/verify-email`  
**Expected Status:** 200  
**Prerequisites:** Get token from email or database

```bash
# Get verification token from database or email service
# For testing, retrieve from email_verification_tokens table:
# SELECT token_hash FROM email_verification_tokens 
# WHERE user_id = (SELECT id FROM users WHERE email = '$TEST_EMAIL')
# Format: "user_id:token_hash"

VERIFY_TOKEN="550e8400-e29b-41d4-a716-446655440000:abc123..."

curl -X POST $BASE_URL/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$VERIFY_TOKEN'"
  }' | jq .
```

**Expected Response:**
```json
{
  "message": "Email verified successfully"
}
```

**Verification:**
- ✅ Status 200 OK
- ✅ User.email_verified = true in database
- ✅ Token marked as used (verified_at set)

---

#### 1.5 Verify Email Error: Already Verified
**Endpoint:** `POST /v1/auth/verify-email`  
**Expected Status:** 400  
**Prerequisites:** Try to verify same token twice

```bash
# Try to use same verification token again
curl -X POST $BASE_URL/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$VERIFY_TOKEN'"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid or expired email verification token",
  "error": "Bad Request"
}
```

**Verification:**
- ✅ Status 400 Bad Request
- ✅ One-time use enforced
- ✅ Second use rejected

---

#### 1.6 Login Error: Email Not Verified
**Endpoint:** `POST /v1/auth/login`  
**Expected Status:** 400  
**Prerequisites:** Signup but don't verify email

```bash
# Create another test user
UNVERIFIED_EMAIL="unverified-$(date +%s)@example.com"

# Signup
curl -X POST $BASE_URL/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "'$UNVERIFIED_EMAIL'", "password": "'$TEST_PASSWORD'"}'

# Try to login without verification
curl -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$UNVERIFIED_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Email not verified. Check your email for verification link.",
  "error": "Bad Request"
}
```

**Verification:**
- ✅ Status 400 Bad Request
- ✅ Clear message about email verification
- ✅ No tokens issued
- ✅ Login possible only after verification

---

#### 1.7 Login (Positive Case)
**Endpoint:** `POST /v1/auth/login`  
**Expected Status:** 200  
**Prerequisites:** User created and email verified

```bash
curl -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }' | jq .
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "auth-test-1721161234@example.com",
    "role": "CUSTOMER",
    "firstName": "Auth",
    "lastName": "Test"
  },
  "expiresIn": 900
}
```

**Verification:**
- ✅ Status 200 OK
- ✅ accessToken is valid JWT (900s = 15 minutes)
- ✅ refreshToken is valid JWT (604800s = 7 days)
- ✅ User info returned (no password)
- ✅ Session created in database
- ✅ IP address and User-Agent captured

**Save for Next Tests:**
```bash
export ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 1.8 Login Error: Wrong Password
**Endpoint:** `POST /v1/auth/login`  
**Expected Status:** 401

```bash
curl -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "WrongPass@1234"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**Verification:**
- ✅ Status 401 Unauthorized
- ✅ Generic error (no differentiation)
- ✅ No tokens issued
- ✅ Response identical to wrong email

---

#### 1.9 Login Error: Non-existent Email
**Endpoint:** `POST /v1/auth/login`  
**Expected Status:** 401

```bash
curl -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent-'$(date +%s)'@example.com",
    "password": "Test@1234"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**Verification:**
- ✅ Status 401 Unauthorized
- ✅ Same error as wrong password
- ✅ No email existence leak
- ✅ Response timing similar

---

#### 1.10 Refresh Access Token
**Endpoint:** `POST /v1/auth/refresh`  
**Expected Status:** 200  
**Prerequisites:** Valid refreshToken from login

```bash
curl -X POST $BASE_URL/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }' | jq .
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Verification:**
- ✅ Status 200 OK
- ✅ New accessToken issued (different from old)
- ✅ expiresIn is 900 (15 minutes)
- ✅ Old accessToken still works until refresh
- ✅ Session still active in database

**Save New Token:**
```bash
export ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 1.11 Refresh Error: Expired Token
**Endpoint:** `POST /v1/auth/refresh`  
**Expected Status:** 401  
**Prerequisites:** Let refreshToken expire (7 days) or revoke it

```bash
# Wait 7 days or simulate expired token
curl -X POST $BASE_URL/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token",
  "error": "Unauthorized"
}
```

**Verification:**
- ✅ Status 401 Unauthorized
- ✅ Clear message about token
- ✅ No new token issued

---

#### 1.12 Logout (All Sessions)
**Endpoint:** `POST /v1/auth/logout`  
**Expected Status:** 200  
**Authentication:** Bearer accessToken

```bash
curl -X POST $BASE_URL/v1/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Verification:**
- ✅ Status 200 OK
- ✅ Logout message returned
- ✅ All sessions deleted from database (sessions.where user_id = X)
- ✅ refreshToken no longer works

**Test Revoked Refresh Token:**
```bash
# Try to refresh after logout
curl -X POST $BASE_URL/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "'$REFRESH_TOKEN'"}' | jq .

# Expected: 401 "Refresh token has been revoked or expired"
```

---

### Test Flow 2: Password Reset Flow

#### 2.1 Request Password Reset
**Endpoint:** `POST /v1/auth/password-reset`  
**Expected Status:** 200  
**Important:** Same response for existing and non-existing emails (security)

```bash
curl -X POST $BASE_URL/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'"
  }' | jq .
```

**Expected Response:**
```json
{
  "message": "If the email is registered, password reset instructions have been sent"
}
```

**Verification:**
- ✅ Status 200 OK (even if email doesn't exist)
- ✅ Generic message (no confirmation)
- ✅ Email sent to user (check email service)
- ✅ Password reset token created with 24hr expiry
- ✅ Token marked as unused

**Save Token for Next Test:**
```bash
# Get from email or database:
# SELECT token_hash FROM password_reset_tokens WHERE user_id = '...' LIMIT 1
# Format: "user_id:token_hash"
export RESET_TOKEN="550e8400-e29b-41d4-a716-446655440000:def456..."
```

---

#### 2.2 Request Password Reset (Non-existent Email)
**Endpoint:** `POST /v1/auth/password-reset`  
**Expected Status:** 200

```bash
curl -X POST $BASE_URL/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent-'$(date +%s)'@example.com"
  }' | jq .
```

**Expected Response:**
```json
{
  "message": "If the email is registered, password reset instructions have been sent"
}
```

**Verification:**
- ✅ Status 200 OK (same as existing email)
- ✅ Same message (no email enumeration)
- ✅ No email sent (user doesn't exist)
- ✅ Response time similar to existing email case

---

#### 2.3 Confirm Password Reset
**Endpoint:** `POST /v1/auth/password-reset/confirm`  
**Expected Status:** 200  
**Prerequisites:** Valid reset token from step 2.1

```bash
NEW_PASSWORD="Updated@2024Pass"

curl -X POST $BASE_URL/v1/auth/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$RESET_TOKEN'",
    "newPassword": "'$NEW_PASSWORD'"
  }' | jq .
```

**Expected Response:**
```json
{
  "message": "Password reset successfully. Please login with your new password."
}
```

**Verification:**
- ✅ Status 200 OK
- ✅ User's password updated in database (password_hash changed)
- ✅ password_changed_at timestamp updated
- ✅ All user sessions revoked (forced re-login)
- ✅ Reset token marked as used (used_at set)

**Test New Password Works:**
```bash
curl -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$NEW_PASSWORD'"
  }' | jq .

# Expected: 200 OK with new tokens
```

---

#### 2.4 Confirm Password Reset Error: Invalid Token
**Endpoint:** `POST /v1/auth/password-reset/confirm`  
**Expected Status:** 400

```bash
curl -X POST $BASE_URL/v1/auth/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid-token-format",
    "newPassword": "NewPass@5678"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid password reset token",
  "error": "Bad Request"
}
```

**Verification:**
- ✅ Status 400 Bad Request
- ✅ Clear error message
- ✅ Password not changed

---

#### 2.5 Confirm Password Reset Error: Token Already Used
**Endpoint:** `POST /v1/auth/password-reset/confirm`  
**Expected Status:** 400  
**Prerequisites:** Try to use same token twice

```bash
curl -X POST $BASE_URL/v1/auth/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$RESET_TOKEN'",
    "newPassword": "AnotherPass@9999"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Invalid or expired password reset token",
  "error": "Bad Request"
}
```

**Verification:**
- ✅ Status 400 Bad Request
- ✅ One-time use enforced
- ✅ Password not changed again
- ✅ used_at timestamp prevents reuse

---

#### 2.6 Confirm Password Reset Error: Weak Password
**Endpoint:** `POST /v1/auth/password-reset/confirm`  
**Expected Status:** 400

```bash
# Get fresh reset token first
curl -X POST $BASE_URL/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "'$TEST_EMAIL'"}'

# Try to reset with weak password
curl -X POST $BASE_URL/v1/auth/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'$NEW_RESET_TOKEN'",
    "newPassword": "weak"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Password must be at least 8 characters long",
  "error": "Bad Request"
}
```

**Verification:**
- ✅ Status 400 Bad Request
- ✅ Password strength enforced
- ✅ Password not changed

---

### Test Flow 3: Change Password (Authenticated)

#### 3.1 Change Password
**Endpoint:** `POST /v1/auth/change-password`  
**Expected Status:** 200  
**Authentication:** Bearer accessToken

```bash
# Login first to get tokens
LOGIN=$(curl -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$NEW_PASSWORD'"
  }')

ACCESS_TOKEN=$(echo $LOGIN | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN | jq -r '.refreshToken')

# Change password
curl -X POST $BASE_URL/v1/auth/change-password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "'$NEW_PASSWORD'",
    "newPassword": "FinalPass@2024"
  }' | jq .
```

**Expected Response:**
```json
{
  "message": "Password changed successfully. Please login with your new password."
}
```

**Verification:**
- ✅ Status 200 OK
- ✅ User's password updated
- ✅ password_changed_at timestamp updated
- ✅ All sessions revoked (forced re-login on other devices)
- ✅ Old password no longer works

**Test New Password Works:**
```bash
curl -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "FinalPass@2024"
  }' | jq .

# Expected: 200 OK with new tokens
```

---

#### 3.2 Change Password Error: Wrong Old Password
**Endpoint:** `POST /v1/auth/change-password`  
**Expected Status:** 401

```bash
curl -X POST $BASE_URL/v1/auth/change-password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "WrongOldPassword@123",
    "newPassword": "NewPass@9999"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Old password is incorrect",
  "error": "Unauthorized"
}
```

**Verification:**
- ✅ Status 401 Unauthorized
- ✅ Password not changed
- ✅ Clear error message

---

#### 3.3 Change Password Error: New Same as Old
**Endpoint:** `POST /v1/auth/change-password`  
**Expected Status:** 400

```bash
curl -X POST $BASE_URL/v1/auth/change-password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "FinalPass@2024",
    "newPassword": "FinalPass@2024"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "New password must be different from old password",
  "error": "Bad Request"
}
```

**Verification:**
- ✅ Status 400 Bad Request
- ✅ Password not changed
- ✅ Prevents password reuse

---

#### 3.4 Change Password Error: Weak New Password
**Endpoint:** `POST /v1/auth/change-password`  
**Expected Status:** 400

```bash
curl -X POST $BASE_URL/v1/auth/change-password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "FinalPass@2024",
    "newPassword": "weak"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Password must be at least 8 characters long",
  "error": "Bad Request"
}
```

**Verification:**
- ✅ Status 400 Bad Request
- ✅ Password strength enforced
- ✅ Password not changed

---

#### 3.5 Change Password Error: No Authentication
**Endpoint:** `POST /v1/auth/change-password`  
**Expected Status:** 401

```bash
curl -X POST $BASE_URL/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "FinalPass@2024",
    "newPassword": "NewPass@9999"
  }' | jq .
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Verification:**
- ✅ Status 401 Unauthorized
- ✅ Requires valid JWT token
- ✅ Cannot change password unauthenticated

---

## Security-Specific Test Cases

### Rate Limiting Tests

#### Rate Limit: Login Endpoint (10/15min)
```bash
#!/bin/bash
# Test login rate limiting

BASE_URL="http://localhost:3010"
EMAIL="test@example.com"
PASSWORD="wrongpassword"

echo "Testing login rate limit (10 requests per 15 minutes)..."

for i in {1..12}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}')
  
  STATUS=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -1)
  
  if [ $i -le 10 ]; then
    if [ "$STATUS" = "401" ]; then
      echo "✅ Request $i: Status $STATUS (auth error as expected)"
    else
      echo "❌ Request $i: Status $STATUS (expected 401)"
    fi
  else
    if [ "$STATUS" = "429" ]; then
      echo "✅ Request $i: Status $STATUS (rate limited as expected)"
    else
      echo "❌ Request $i: Status $STATUS (expected 429)"
    fi
  fi
  
  sleep 0.1
done
```

---

#### Rate Limit: Signup Endpoint (5/15min)
```bash
#!/bin/bash
# Test signup rate limiting

BASE_URL="http://localhost:3010"
PASSWORD="Test@1234"

echo "Testing signup rate limit (5 requests per 15 minutes)..."

for i in {1..7}; do
  EMAIL="test-$i-$(date +%s%N)@example.com"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}')
  
  STATUS=$(echo "$RESPONSE" | tail -1)
  
  if [ $i -le 5 ]; then
    if [ "$STATUS" = "201" ] || [ "$STATUS" = "409" ]; then
      echo "✅ Request $i: Status $STATUS (signup attempted)"
    else
      echo "❌ Request $i: Status $STATUS"
    fi
  else
    if [ "$STATUS" = "429" ]; then
      echo "✅ Request $i: Status $STATUS (rate limited as expected)"
    else
      echo "❌ Request $i: Status $STATUS (expected 429)"
    fi
  fi
  
  sleep 0.1
done
```

---

#### Rate Limit: Password Reset Endpoint (3/15min)
```bash
#!/bin/bash
# Test password reset rate limiting

BASE_URL="http://localhost:3010"
EMAIL="test@example.com"

echo "Testing password reset rate limit (3 requests per 15 minutes)..."

for i in {1..5}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/v1/auth/password-reset \
    -H "Content-Type: application/json" \
    -d '{"email":"'$EMAIL'"}')
  
  STATUS=$(echo "$RESPONSE" | tail -1)
  
  if [ $i -le 3 ]; then
    if [ "$STATUS" = "200" ]; then
      echo "✅ Request $i: Status $STATUS"
    else
      echo "❌ Request $i: Status $STATUS (expected 200)"
    fi
  else
    if [ "$STATUS" = "429" ]; then
      echo "✅ Request $i: Status $STATUS (rate limited as expected)"
    else
      echo "❌ Request $i: Status $STATUS (expected 429)"
    fi
  fi
  
  sleep 0.1
done
```

---

### JWT Token Validation Tests

#### Decode and Verify Access Token
```bash
#!/bin/bash
# Decode JWT token and verify claims

TOKEN="$1"

if [ -z "$TOKEN" ]; then
  echo "Usage: $0 <jwt-token>"
  exit 1
fi

echo "Token Header:"
echo $TOKEN | cut -d. -f1 | base64 -d | jq .

echo ""
echo "Token Payload:"
PAYLOAD=$(echo $TOKEN | cut -d. -f2 | base64 -d | jq .)
echo $PAYLOAD

echo ""
echo "Verification:"
echo "- Contains 'sub' (user ID): $(echo $PAYLOAD | jq -r '.sub')"
echo "- Contains 'email': $(echo $PAYLOAD | jq -r '.email')"
echo "- Contains 'role': $(echo $PAYLOAD | jq -r '.role')"
echo "- Contains 'iat' (issued at): $(echo $PAYLOAD | jq -r '.iat')"
echo "- Contains 'exp' (expires): $(echo $PAYLOAD | jq -r '.exp')"

# Calculate expiry
IAT=$(echo $PAYLOAD | jq -r '.iat')
EXP=$(echo $PAYLOAD | jq -r '.exp')
EXPIRY=$((EXP - IAT))
echo "- Token expires in: $EXPIRY seconds"

# Verify it's 15 minutes (900 seconds) for access token
if [ "$EXPIRY" = "900" ]; then
  echo "✅ Access token expiry is correct (15 minutes)"
else
  echo "❌ Access token expiry is incorrect (expected 900, got $EXPIRY)"
fi
```

**Usage:**
```bash
chmod +x decode-jwt.sh
./decode-jwt.sh "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Password Strength Tests

#### Test Weak Passwords
```bash
#!/bin/bash
# Test password strength validation

BASE_URL="http://localhost:3010"
EMAIL="test-$(date +%s)@example.com"

PASSWORDS=(
  "abc123"        # Too short
  "abcdefgh"      # No uppercase
  "ABCDEFGH"      # No lowercase
  "Abcdefgh"      # No digit
  "Abcdef123"     # No special char
  "Test@1234"     # Valid
)

echo "Testing password strength validation..."

for password in "${PASSWORDS[@]}"; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"'$EMAIL'","password":"'$password'"}')
  
  STATUS=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -1)
  
  if [ "$password" = "Test@1234" ]; then
    if [ "$STATUS" = "201" ]; then
      echo "✅ Password '$password' accepted"
    fi
  else
    if [ "$STATUS" = "400" ]; then
      echo "✅ Password '$password' rejected: $(echo $BODY | jq -r '.message')"
    fi
  fi
done
```

---

## Error Message Validation Tests

### Login Error Consistency
```bash
#!/bin/bash
# Verify login errors are consistent (no email enumeration)

BASE_URL="http://localhost:3010"

echo "Testing login error consistency..."

# Test 1: Non-existent email
ERROR1=$(curl -s -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent-'$(date +%s)'@example.com","password":"Test@1234"}' \
  | jq -r '.message')

# Test 2: Wrong password for existing user
ERROR2=$(curl -s -X POST $BASE_URL/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verified@example.com","password":"WrongPass"}' \
  | jq -r '.message')

if [ "$ERROR1" = "$ERROR2" ]; then
  echo "✅ Login errors are consistent: '$ERROR1'"
else
  echo "❌ Login errors differ:"
  echo "  Non-existent email: $ERROR1"
  echo "  Wrong password: $ERROR2"
fi
```

---

## Database Integrity Tests

### Verify Password Hash Storage
```bash
#!/bin/bash
# Check password storage in database

echo "Checking password hash storage..."

# Connect to database
psql -h localhost -U postgres -d wise2_core -c "
  SELECT 
    email,
    substring(password_hash, 1, 10) as hash_prefix,
    length(password_hash) as hash_length
  FROM users
  LIMIT 1;
"

# Expected output:
# - hash_prefix should start with \$2a\$, \$2b\$, or \$2y\$ (bcrypt)
# - hash_length should be 60 (bcrypt hash length)
```

---

### Verify Session Creation
```bash
#!/bin/bash
# Check session creation on login

USER_ID="550e8400-e29b-41d4-a716-446655440000"

echo "Checking active sessions..."

psql -h localhost -U postgres -d wise2_core -c "
  SELECT 
    id,
    user_id,
    ip_address,
    user_agent,
    created_at,
    expires_at
  FROM sessions
  WHERE user_id = '$USER_ID'
  AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 5;
"

# Should show recent sessions with IP and User-Agent
```

---

### Verify Cascade Delete
```bash
#!/bin/bash
# Test cascade delete on user deletion

USER_EMAIL="test-cascade-$(date +%s)@example.com"

echo "Testing cascade delete..."

# 1. Signup user
curl -s -X POST http://localhost:3010/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"'$USER_EMAIL'","password":"Test@1234"}' > /dev/null

# Get user ID
USER_ID=$(psql -h localhost -U postgres -d wise2_core -t -c "
  SELECT id FROM users WHERE email = '$USER_EMAIL'
")

echo "Created user: $USER_ID"

# 2. Create sessions and tokens
# (Login to create session)
curl -s -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'$USER_EMAIL'","password":"Test@1234"}' > /dev/null

# 3. Count related records before delete
SESSIONS_BEFORE=$(psql -h localhost -U postgres -d wise2_core -t -c "
  SELECT COUNT(*) FROM sessions WHERE user_id = '$USER_ID'
")

# 4. Delete user
psql -h localhost -U postgres -d wise2_core -c "
  DELETE FROM users WHERE id = '$USER_ID'
"

# 5. Count related records after delete
SESSIONS_AFTER=$(psql -h localhost -U postgres -d wise2_core -t -c "
  SELECT COUNT(*) FROM sessions WHERE user_id = '$USER_ID'
")

echo "Sessions before delete: $SESSIONS_BEFORE"
echo "Sessions after delete: $SESSIONS_AFTER"

if [ "$SESSIONS_AFTER" = "0" ]; then
  echo "✅ Cascade delete working (sessions removed)"
else
  echo "❌ Cascade delete failed (sessions still exist)"
fi
```

---

## Performance Tests

### Load Test: Concurrent Logins
```bash
#!/bin/bash
# Test performance under load

BASE_URL="http://localhost:3010"
EMAIL="loadtest@example.com"
PASSWORD="Test@1234"
CONCURRENT=50

echo "Running concurrent login test with $CONCURRENT users..."

# Create test user (if not exists)
curl -s -X POST $BASE_URL/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}' > /dev/null 2>&1

# Verify email (in test environment, manually set or use admin endpoint)

START_TIME=$(date +%s%N)

for i in $(seq 1 $CONCURRENT); do
  (
    curl -s -X POST $BASE_URL/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}' > /dev/null
    echo "Request $i completed"
  ) &
done

wait

END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000))

echo ""
echo "Test Results:"
echo "- Concurrent requests: $CONCURRENT"
echo "- Total time: ${DURATION}ms"
echo "- Average time per request: $((DURATION / CONCURRENT))ms"

if [ $((DURATION / CONCURRENT)) -lt 500 ]; then
  echo "✅ Performance acceptable (< 500ms average)"
else
  echo "❌ Performance degraded (> 500ms average)"
fi
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. "Email not verified" when trying to login
**Problem:** User can't login after signup
**Solution:** 
```bash
# Manually verify email in test database
psql -h localhost -U postgres -d wise2_core -c "
  UPDATE users 
  SET email_verified = true 
  WHERE email = 'test@example.com'
"
```

#### 2. "Rate limit exceeded" during testing
**Problem:** Getting 429 too quickly
**Solution:**
```bash
# Wait 15 minutes or reset the rate limiter in Redis
redis-cli -n 0 FLUSHALL
```

#### 3. "Invalid token format" on email verification
**Problem:** Token format mismatch
**Solution:**
```bash
# Verify token format: "userId:tokenHash"
# Get from database:
psql -h localhost -U postgres -d wise2_core -c "
  SELECT user_id, token_hash FROM email_verification_tokens LIMIT 1
"
# Combine as: 'user_id:token_hash'
```

#### 4. "No email sent" for password reset
**Problem:** Email service not working
**Solution:**
```bash
# Check email service logs
tail -f logs/email.log

# Or check if email was queued
psql -h localhost -U postgres -d wise2_core -c "
  SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5
"
```

#### 5. JWT decode errors
**Problem:** Can't decode JWT token
**Solution:**
```bash
# Ensure proper JWT format: header.payload.signature
# Each part should be base64 encoded
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0..."

# Verify it has 3 parts separated by dots
echo $TOKEN | tr -cd '.' | wc -c  # Should output 2 (two dots)

# Try decoding manually
echo $TOKEN | cut -d. -f2 | base64 -d
```

---

## Summary

**Total Test Flows:** 3  
**Total Test Cases:** 25+  
**Total Security Tests:** 20+  
**Estimated Execution Time:** 2-3 hours (manual)

**Coverage:**
- ✅ Signup & Email Verification
- ✅ Login & Authentication
- ✅ Token Refresh
- ✅ Logout & Session Revocation
- ✅ Password Reset
- ✅ Password Change
- ✅ Rate Limiting
- ✅ Error Messages
- ✅ Token Validation
- ✅ Database Integrity
- ✅ Performance & Load Testing

All tests include expected responses, pass/fail criteria, and verification steps.
