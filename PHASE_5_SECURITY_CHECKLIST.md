# Phase 5: WISE² Authentication - Security Hardening & Testing Checklist

**Objective:** Verify all security controls are working end-to-end for the JWT authentication system.

**Production Server:** 173.208.147.165  
**Development Server:** localhost:3010  
**API Base URL:** `/v1/auth`

---

## 1. Password Requirements Enforcement

### 1.1 Strong Password Requirements Test
**CVE/OWASP Risk:** CWE-521 (Weak Password Requirements), OWASP A07:2021 (Identification and Authentication Failures)

**Requirement:** Passwords must meet ALL of:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?`)

**Test Cases:**

| Test Case | Input | Expected Status | Expected Error | Notes |
|-----------|-------|-----------------|-----------------|-------|
| Too short | `Abc123!` (7 chars) | 400 | "at least 8 characters" | Should reject |
| No uppercase | `abcdef123!` | 400 | "uppercase letter" | Should reject |
| No lowercase | `ABCDEF123!` | 400 | "lowercase letter" | Should reject |
| No digit | `Abcdefgh!` | 400 | "digit" | Should reject |
| No special | `Abcdefgh123` | 400 | "special character" | Should reject |
| Valid strong | `Test@1234` | 201 | N/A | Should accept on signup |
| Valid strong | `MyP@ssw0rd` | 201 | N/A | Should accept on signup |

**How to Test:**
```bash
# Weak password - too short
curl -X POST http://localhost:3010/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Abc123!"}'

# Valid password
curl -X POST http://localhost:3010/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

**Pass Criteria:**
- ✅ Weak passwords rejected with 400 status
- ✅ Error messages describe requirements clearly
- ✅ Strong passwords accepted with 201 status

---

### 1.2 Error Message Security
**CVE/OWASP Risk:** CWE-209 (Information Exposure), OWASP A01:2021 (Broken Access Control)

**Requirement:** Error messages must NOT reveal which specific requirements failed

**Test Cases:**

| Test Case | Expected Behavior |
|-----------|-------------------|
| Too short | Reject with generic error (not listing requirement) |
| Missing uppercase | Reject with generic error |
| Missing special char | Reject with generic error |

**How to Test:**
```bash
# Check error message doesn't leak specific requirements
curl -X POST http://localhost:3010/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq '.message'
```

**Pass Criteria:**
- ✅ Error message guides users without leaking implementation details
- ✅ No stack traces in error messages
- ✅ Consistent error messaging across all endpoints

---

## 2. Rate Limiting Verification

### 2.1 Login Endpoint Rate Limiting
**CVE/OWASP Risk:** CWE-307 (Improper Restriction of Rendered UI Layers), OWASP A07:2021 (Brute Force)

**Configuration:** 10 requests per 15 minutes (900,000 ms)

**Test Cases:**

| Request # | Delay | Expected Status | Expected Response |
|-----------|-------|-----------------|-------------------|
| 1-10 | Immediate | 401 | "Invalid email or password" |
| 11 | 100ms | 429 | "Too Many Requests" |
| 12 | After 15 min | 401 | Should work again |

**How to Test:**
```bash
#!/bin/bash
# Test login rate limiting
BASE_URL="http://localhost:3010/v1/auth/login"

for i in {1..12}; do
  echo "Request $i:"
  curl -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.1
done
```

**Pass Criteria:**
- ✅ Requests 1-10 return 401 (auth error)
- ✅ Request 11 returns 429 (rate limit)
- ✅ After 15 minutes, requests succeed/fail normally again

### 2.2 Signup Endpoint Rate Limiting
**Configuration:** 5 requests per 15 minutes

**Test Cases:** Similar to login, but limit is 5 instead of 10

**How to Test:**
```bash
BASE_URL="http://localhost:3010/v1/auth/signup"
for i in {1..7}; do
  curl -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"Test@1234"}'
  sleep 0.1
done
```

**Pass Criteria:**
- ✅ Requests 1-5 return 201 or 409 (registration or conflict)
- ✅ Request 6 returns 429 (rate limit)

### 2.3 Password Reset Endpoint Rate Limiting
**Configuration:** 3 requests per 15 minutes

**How to Test:**
```bash
BASE_URL="http://localhost:3010/v1/auth/password-reset"
for i in {1..5}; do
  curl -X POST $BASE_URL \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  sleep 0.1
done
```

**Pass Criteria:**
- ✅ Requests 1-3 return 200
- ✅ Request 4 returns 429

---

## 3. JWT Token Security

### 3.1 Access Token Expiry Verification
**CVE/OWASP Risk:** CWE-613 (Insufficient Session Expiration), OWASP A07:2021 (Identification and Authentication Failures)

**Requirement:** Access tokens must expire in 15 minutes

**How to Test:**
```bash
# 1. Login and get accessToken
RESPONSE=$(curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verified@example.com","password":"Test@1234"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

# 2. Decode token and check 'exp' claim
node -e "console.log(JSON.parse(Buffer.from('$ACCESS_TOKEN'.split('.')[1], 'base64').toString()))"

# 3. Calculate expiry
# exp - iat should equal 900 seconds (15 minutes)
```

**Pass Criteria:**
- ✅ Token has 'exp' claim
- ✅ Token expiry is 900 seconds (15 minutes)
- ✅ Token is signed with HS256 algorithm

### 3.2 Refresh Token Expiry Verification
**Requirement:** Refresh tokens must expire in 7 days

**How to Test:**
```bash
# Decode refreshToken and verify exp - iat = 604800 (7 days)
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')
node -e "console.log(JSON.parse(Buffer.from('$REFRESH_TOKEN'.split('.')[1], 'base64').toString()))"
```

**Pass Criteria:**
- ✅ Refresh token expiry is 604800 seconds (7 days)

### 3.3 Token Payload Security
**CVE/OWASP Risk:** CWE-532 (Insertion of Sensitive Information into Log File), OWASP A01:2021 (Broken Access Control)

**Requirement:** Token payload must NOT contain sensitive data like password hashes

**How to Test:**
```bash
# Decode both tokens and inspect payload
ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
PAYLOAD=$(node -e "console.log(JSON.parse(Buffer.from('$ACCESS_TOKEN'.split('.')[1], 'base64').toString()))")
echo $PAYLOAD | jq .

# Should contain: sub (user ID), email, role, iat, exp
# Should NOT contain: password_hash, password, token_hash
```

**Pass Criteria:**
- ✅ Payload contains: sub, email, role, iat, exp
- ✅ Payload does NOT contain: password, password_hash, token_hash, personal_info

### 3.4 Algorithm Verification
**CVE/OWASP Risk:** CWE-327 (Use of Broken Algorithm), OWASP A06:2021 (Vulnerable Components)

**How to Test:**
```bash
# Check JWT header
node -e "
const token = '$ACCESS_TOKEN';
const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
console.log('Algorithm:', header.alg);
console.log('Type:', header.typ);
"
```

**Pass Criteria:**
- ✅ Algorithm is 'HS256' (HMAC SHA-256)
- ✅ Type is 'JWT'
- ✅ No 'none' algorithm support

---

## 4. Password Reset Security

### 4.1 Reset Token Expiry
**CVE/OWASP Risk:** CWE-613 (Insufficient Session Expiration)

**Requirement:** Password reset tokens must expire in 24 hours

**How to Test:**
```bash
# 1. Request password reset
curl -X POST http://localhost:3010/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Extract token from email (in test, get from database or email queue)
# SELECT token_hash, expires_at FROM password_reset_tokens WHERE user_id = '...'

# 3. Calculate: expires_at - created_at should equal 86400000 ms (24 hours)
```

**Pass Criteria:**
- ✅ Reset tokens expire in 24 hours
- ✅ Expired tokens rejected with 400 status
- ✅ Database tracks token creation and expiry times

### 4.2 One-Time Use Enforcement
**CVE/OWASP Risk:** CWE-640 (Weak Password Recovery Mechanism)

**Requirement:** Reset tokens can only be used once

**How to Test:**
```bash
# 1. Get password reset token (from email or database)
# 2. Use token to reset password
curl -X POST http://localhost:3010/v1/auth/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"userId:tokenHash","newPassword":"NewPass@1234"}'
# Expected: 200 OK

# 3. Try to use same token again
curl -X POST http://localhost:3010/v1/auth/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"userId:tokenHash","newPassword":"AnotherPass@5678"}'
# Expected: 400 (Invalid or expired token)
```

**Pass Criteria:**
- ✅ First use succeeds with 200
- ✅ Second use with same token fails with 400
- ✅ Database marks token with `used_at` timestamp

### 4.3 Email Existence Leak Prevention
**CVE/OWASP Risk:** CWE-203 (Observable Discrepancy), OWASP A01:2021 (Broken Access Control)

**Requirement:** Always return same response regardless of email existence

**How to Test:**
```bash
# Request 1: Email that exists
RESPONSE1=$(curl -X POST http://localhost:3010/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"registered@example.com"}')
echo $RESPONSE1

# Request 2: Email that doesn't exist
RESPONSE2=$(curl -X POST http://localhost:3010/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}')
echo $RESPONSE2

# Both should have identical response
```

**Pass Criteria:**
- ✅ Both requests return identical 200 response
- ✅ Same message body in both cases
- ✅ No timing attack vulnerability (response time similar)

---

## 5. Email Verification Security

### 5.1 Verification Token Expiry
**CVE/OWASP Risk:** CWE-613 (Insufficient Session Expiration)

**Requirement:** Email verification tokens expire in 24 hours

**How to Test:**
```bash
# 1. Signup and get verification token
# 2. Check database: SELECT expires_at FROM email_verification_tokens WHERE user_id = '...'
# 3. Verify: expires_at - created_at = 86400000 ms

# 4. Try to verify after 24 hours (simulate by setting expires_at to past)
curl -X POST http://localhost:3010/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"userId:expiredTokenHash"}'
# Expected: 400 (Invalid or expired token)
```

**Pass Criteria:**
- ✅ Tokens expire in 24 hours
- ✅ Expired tokens rejected with 400

### 5.2 One-Time Use Enforcement
**CVE/OWASP Risk:** CWE-640 (Weak Password Recovery Mechanism)

**How to Test:**
```bash
# 1. Verify email with valid token
curl -X POST http://localhost:3010/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"userId:tokenHash"}'
# Expected: 200 OK, email_verified = true

# 2. Try to verify with same token again
curl -X POST http://localhost:3010/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"userId:tokenHash"}'
# Expected: 400 (Invalid or expired token)
```

**Pass Criteria:**
- ✅ First use succeeds
- ✅ Second use fails with 400
- ✅ Database marks token with `verified_at` timestamp

### 5.3 Pre-Verification Login Block
**CVE/OWASP Risk:** CWE-640 (Weak Password Recovery), OWASP A07:2021 (Identification and Authentication Failures)

**Requirement:** Users cannot login until email is verified

**How to Test:**
```bash
# 1. Signup (email_verified = false)
curl -X POST http://localhost:3010/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"unverified@example.com","password":"Test@1234"}'

# 2. Try to login before verification
curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"unverified@example.com","password":"Test@1234"}'
# Expected: 400 (Email not verified)

# 3. Verify email
curl -X POST http://localhost:3010/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"userId:tokenHash"}'

# 4. Try to login after verification
curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"unverified@example.com","password":"Test@1234"}'
# Expected: 200 OK with tokens
```

**Pass Criteria:**
- ✅ Unverified users cannot login (400 error)
- ✅ Error message indicates email not verified
- ✅ After verification, login succeeds

---

## 6. Session Management Security

### 6.1 Session Creation on Login
**CVE/OWASP Risk:** CWE-384 (Session Fixation), OWASP A07:2021 (Identification and Authentication Failures)

**Requirement:** Each login creates a new session in database

**How to Test:**
```bash
# 1. Login first time
curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verified@example.com","password":"Test@1234"}'

# 2. Check database
# SELECT COUNT(*) FROM sessions WHERE user_id = '...' AND expires_at > NOW()

# 3. Login second time
curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verified@example.com","password":"Test@1234"}'

# 4. Check database again
# SELECT COUNT(*) FROM sessions WHERE user_id = '...' AND expires_at > NOW()
# Should be 2 (two active sessions)
```

**Pass Criteria:**
- ✅ Each login creates new session entry
- ✅ Sessions tracked in database with timestamps
- ✅ Session has ip_address and user_agent fields

### 6.2 Session Revocation on Logout
**CVE/OWASP Risk:** CWE-384 (Session Fixation)

**How to Test:**
```bash
# 1. Login and get tokens
LOGIN_RESPONSE=$(curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verified@example.com","password":"Test@1234"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

# 2. Use token to access protected endpoint (verify it works)
curl -X POST http://localhost:3010/v1/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
# Expected: 200 OK

# 3. Check database
# SELECT COUNT(*) FROM sessions WHERE user_id = '...' AND expires_at > NOW()
# Should be 0 (all sessions revoked)

# 4. Try to use refreshToken
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')
curl -X POST http://localhost:3010/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'$REFRESH_TOKEN'"}'
# Expected: 401 (Refresh token has been revoked)
```

**Pass Criteria:**
- ✅ Logout succeeds with 200
- ✅ All sessions deleted from database
- ✅ Refresh token no longer works after logout

### 6.3 Full Logout (All Sessions)
**CVE/OWASP Risk:** CWE-384 (Session Fixation)

**Requirement:** Logout revokes ALL sessions for user

**How to Test:**
```bash
# 1. Login twice to create two sessions
TOKEN1=$(curl ... | jq -r '.accessToken')
TOKEN2=$(curl ... | jq -r '.accessToken')

# 2. Logout using first token
curl -X POST http://localhost:3010/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN1"

# 3. Try to refresh using second token
curl -X POST http://localhost:3010/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"...'second token'..."}'
# Expected: 401 (All sessions revoked)
```

**Pass Criteria:**
- ✅ All sessions revoked regardless of which one used logout
- ✅ Both tokens no longer work

### 6.4 Session Tracking
**CVE/OWASP Risk:** CWE-384 (Session Fixation), OWASP A04:2021 (Insecure Design)

**Requirement:** Sessions track IP address and User-Agent

**How to Test:**
```bash
# 1. Login with custom User-Agent
curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: MyApp/1.0" \
  -d '{"email":"verified@example.com","password":"Test@1234"}'

# 2. Check database
# SELECT ip_address, user_agent FROM sessions WHERE user_id = '...'
# Should contain: IP and "MyApp/1.0"
```

**Pass Criteria:**
- ✅ Session stores ip_address
- ✅ Session stores user_agent
- ✅ Values populated on login

---

## 7. Input Validation Security

### 7.1 Email Format Validation
**CVE/OWASP Risk:** CWE-20 (Improper Input Validation), OWASP A03:2021 (Injection)

**Test Cases:**

| Email | Expected Status | Notes |
|-------|-----------------|-------|
| `valid@example.com` | 201 | Valid format |
| `invalid.email` | 400 | Missing @ |
| `invalid@.com` | 400 | Missing domain |
| `invalid@example.` | 400 | Missing TLD |
| `@example.com` | 400 | Missing username |
| `test@exam ple.com` | 400 | Contains space |
| `test+tag@example.com` | 201 | Valid with + (optional) |

**How to Test:**
```bash
# Invalid email - missing @
curl -X POST http://localhost:3010/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"invalidemail","password":"Test@1234"}'
# Expected: 400
```

**Pass Criteria:**
- ✅ Invalid formats rejected with 400
- ✅ Valid formats accepted
- ✅ Error message indicates email validation error

### 7.2 SQL Injection Prevention
**CVE/OWASP Risk:** CWE-89 (SQL Injection), OWASP A03:2021 (Injection)

**Test Cases:**

| Input | Expected Status | Notes |
|-------|-----------------|-------|
| `' OR '1'='1` | 400 | SQL injection attempt |
| `admin' --` | 400 | SQL comment injection |
| `"; DROP TABLE users; --` | 400 | Destructive injection |

**How to Test:**
```bash
# SQL injection attempt
curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin'"'"' OR '"'"'1'"'"'='"'"'1","password":"password"}'
# Expected: 400 or 401 (auth fails, not SQL error)
```

**Pass Criteria:**
- ✅ TypeORM automatically escapes inputs (parameterized queries)
- ✅ No SQL error messages leaked to client
- ✅ Always responds with authentication error (401), not SQL error

### 7.3 XSS Prevention in Email Field
**CVE/OWASP Risk:** CWE-79 (Cross-site Scripting), OWASP A03:2021 (Injection)

**Test Cases:**

| Input | Expected Status | Notes |
|-------|-----------------|-------|
| `<script>alert('xss')</script>@example.com` | 400 | XSS in email |
| `test@example.com<img src=x onerror=alert('xss')>` | 400 | Event handler injection |

**How to Test:**
```bash
# XSS attempt in email
curl -X POST http://localhost:3010/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>@example.com","password":"Test@1234"}'
# Expected: 400 (invalid email format)
```

**Pass Criteria:**
- ✅ XSS attempts rejected with 400
- ✅ Email validation catches HTML/JS
- ✅ Database stores sanitized values

---

## 8. CORS & HTTPS Security

### 8.1 CORS Allowed Origins
**CVE/OWASP Risk:** CWE-346 (Origin Validation Error), OWASP A01:2021 (Broken Access Control)

**Requirement:** API only accepts requests from:
- `https://dashboard.wise2.net`
- `https://admin.wise2.net`
- `http://localhost:3000` (dev)

**How to Test:**
```bash
# Request from allowed origin
curl -X OPTIONS http://localhost:3010/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
# Expected: 200 with Access-Control-Allow-Origin header

# Request from disallowed origin
curl -X OPTIONS http://localhost:3010/v1/auth/login \
  -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST"
# Expected: 403 or no CORS headers
```

**Pass Criteria:**
- ✅ Allowed origins get CORS headers
- ✅ Disallowed origins rejected or no headers returned
- ✅ Credentials allowed in CORS (Access-Control-Allow-Credentials: true)

### 8.2 HTTPS Redirect
**CVE/OWASP Risk:** CWE-295 (Improper Certificate Validation), OWASP A02:2021 (Cryptographic Failures)

**How to Test:**
```bash
# From development (localhost) - HTTP allowed
curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
# Expected: Works on localhost

# From production - should redirect
curl -X POST http://api.wise2.net/v1/auth/login \
  -L  # follow redirects
# Expected: 308 redirect to HTTPS, then 401
```

**Pass Criteria:**
- ✅ Production redirects HTTP to HTTPS
- ✅ Development allows HTTP on localhost
- ✅ HSTS header present on HTTPS responses

---

## 9. Error Message Security

### 9.1 Login Error Messages
**CVE/OWASP Risk:** CWE-209 (Information Exposure), OWASP A01:2021 (Broken Access Control)

**Requirement:** Same error for invalid email or password

**How to Test:**
```bash
# Wrong email
RESPONSE1=$(curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com","password":"Test@1234"}')

# Wrong password
RESPONSE2=$(curl -X POST http://localhost:3010/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verified@example.com","password":"WrongPass123"}')

# Both should return identical error
echo $RESPONSE1 | jq '.message'
echo $RESPONSE2 | jq '.message'
```

**Pass Criteria:**
- ✅ Both return "Invalid email or password"
- ✅ No differentiation between invalid email vs password
- ✅ Same 401 status code

### 9.2 Password Reset Error Messages
**CVE/OWASP Risk:** CWE-203 (Observable Discrepancy), CWE-209 (Information Exposure)

**Requirement:** Same message for existent and non-existent emails

**How to Test:**
```bash
# Request 1: Email that exists
curl -X POST http://localhost:3010/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"registered@example.com"}'

# Request 2: Email that doesn't exist
curl -X POST http://localhost:3010/v1/auth/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}'

# Both should return identical 200 response
```

**Pass Criteria:**
- ✅ Both return same message
- ✅ Both return 200 status
- ✅ No timing differences detectable

### 9.3 Signup Error Messages
**CVE/OWASP Risk:** CWE-209 (Information Exposure)

**Test Cases:**

| Scenario | Expected Error | Safe? |
|----------|---|---|
| Email already registered | "Email already in use" | ✅ Okay to reveal |
| Invalid email format | "Invalid email format" | ✅ Generic |
| Weak password | Specific requirement missed | ❌ Should be generic |
| Database error | Generic error, no SQL details | ✅ No stack trace |

**Pass Criteria:**
- ✅ No SQL error messages
- ✅ No stack traces returned
- ✅ Generic errors for system failures

### 9.4 No Stack Traces in Production
**CVE/OWASP Risk:** CWE-209 (Information Exposure), OWASP A01:2021 (Broken Access Control)

**How to Test:**
```bash
# Cause an error
curl -X POST http://localhost:3010/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid"}'
# Response should NOT contain:
# - /var/www/... file paths
# - function names
# - SQL queries
# - variable names (except in generic error messages)
```

**Pass Criteria:**
- ✅ Errors don't expose file paths
- ✅ No SQL queries in errors
- ✅ No TypeORM/database internals leaked

---

## 10. Load Testing

### 10.1 Concurrent Login Performance
**CVE/OWASP Risk:** CWE-400 (Uncontrolled Resource Consumption), OWASP A01:2021 (Broken Access Control)

**Requirement:** System should handle 50 concurrent logins without degradation

**How to Test:**
```bash
#!/bin/bash
# Concurrent login test
BASE_URL="http://localhost:3010/v1/auth/login"
CONCURRENT=50

for i in $(seq 1 $CONCURRENT); do
  (
    curl -X POST $BASE_URL \
      -H "Content-Type: application/json" \
      -d '{"email":"test'$i'@example.com","password":"Test@1234"}' \
      -w "Request $i: %{http_code} - %{time_total}s\n"
  ) &
done
wait

echo "All requests completed"
```

**Pass Criteria:**
- ✅ All 50 requests complete without errors
- ✅ Average response time < 500ms
- ✅ No database lock issues
- ✅ No memory leaks

### 10.2 Token Generation Safety
**CVE/OWASP Risk:** CWE-335 (Incorrect Usage of Secure Random Number Generator)

**Requirement:** No duplicate tokens generated

**How to Test:**
```bash
#!/bin/bash
# Generate 1000 tokens and check for duplicates
TOKENS=()
for i in {1..1000}; do
  RESPONSE=$(curl -X POST http://localhost:3010/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test@1234"}')
  TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
  TOKENS+=($TOKEN)
done

# Check for duplicates
UNIQUE=$(printf '%s\n' "${TOKENS[@]}" | sort -u | wc -l)
if [ $UNIQUE -eq 1000 ]; then
  echo "✅ All 1000 tokens are unique"
else
  echo "❌ Found duplicate tokens"
fi
```

**Pass Criteria:**
- ✅ All 1000+ tokens are unique
- ✅ No duplicate tokens generated
- ✅ Random number generator working correctly

---

## 11. Database Integrity Tests

### 11.1 Foreign Key Constraints
**CVE/OWASP Risk:** CWE-241 (Improper Handling of Unexpected Data Type)

**How to Test:**
```sql
-- Verify foreign keys exist
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name IN ('users', 'sessions', 'password_reset_tokens', 'email_verification_tokens')
AND constraint_name LIKE '%fk%';

-- Should show:
-- sessions.user_id -> users.id
-- password_reset_tokens.user_id -> users.id
-- email_verification_tokens.user_id -> users.id
```

**Pass Criteria:**
- ✅ All foreign keys defined
- ✅ Cascade delete configured appropriately
- ✅ Orphaned records impossible

### 11.2 Cascade Delete Verification
**How to Test:**
```sql
-- Delete a user
DELETE FROM users WHERE id = 'test-user-id';

-- Verify related records deleted
SELECT COUNT(*) FROM sessions WHERE user_id = 'test-user-id';
-- Should be 0

SELECT COUNT(*) FROM password_reset_tokens WHERE user_id = 'test-user-id';
-- Should be 0

SELECT COUNT(*) FROM email_verification_tokens WHERE user_id = 'test-user-id';
-- Should be 0
```

**Pass Criteria:**
- ✅ User deletion cascades to sessions
- ✅ User deletion cascades to tokens
- ✅ No orphaned records remain

### 11.3 Password Hash Storage
**CVE/OWASP Risk:** CWE-256 (Unprotected Storage of Credentials), OWASP A02:2021 (Cryptographic Failures)

**How to Test:**
```sql
-- Check password storage
SELECT id, email, password_hash FROM users LIMIT 1;

-- Password hash should:
-- - Start with $2a$, $2b$, or $2y$ (bcrypt format)
-- - Be approximately 60 characters long
-- - NOT be in plaintext
-- - NOT be a simple hash like MD5/SHA1 (those are too short)
```

**Pass Criteria:**
- ✅ All passwords are bcrypt hashes ($2a$, $2b$, or $2y$)
- ✅ No plaintext passwords in database
- ✅ Hashes are 60 characters (bcrypt standard)

### 11.4 Email Uniqueness
**CVE/OWASP Risk:** CWE-20 (Improper Input Validation)

**How to Test:**
```sql
-- Check unique constraint
SELECT COUNT(*), email FROM users GROUP BY email HAVING COUNT(*) > 1;
-- Should return 0 rows

-- Try to insert duplicate (should fail)
INSERT INTO users (id, email, password_hash, role, status) 
VALUES ('test-id', 'duplicate@example.com', '$2a$...', 'CUSTOMER', 'ACTIVE');
-- Should fail with unique constraint violation
```

**Pass Criteria:**
- ✅ Unique constraint on email column
- ✅ No duplicate emails exist
- ✅ Duplicate insert rejected

### 11.5 Token Hash Storage
**CVE/OWASP Risk:** CWE-256 (Unprotected Storage of Credentials)

**How to Test:**
```sql
-- Verify tokens are hashed
SELECT token_hash FROM password_reset_tokens LIMIT 1;

-- Should be:
-- - 64 hex characters (SHA256)
-- - NOT the plaintext token
-- - NOT reversible
```

**Pass Criteria:**
- ✅ Tokens stored as SHA256 hashes (64 hex chars)
- ✅ No plaintext tokens in database
- ✅ Tokens not reversible

---

## 12. Compliance Tests

### 12.1 Bcrypt Usage Verification
**CVE/OWASP Risk:** CWE-327 (Use of Broken Cryptographic Algorithm), OWASP A02:2021 (Cryptographic Failures)

**How to Test:**
```bash
# Check source code
grep -r "bcrypt" /packages/api/src/auth/
grep -r "rounds" /packages/api/src/auth/password.service.ts

# Should show:
# - bcrypt library imported
# - Minimum 10 rounds (we use 12)
# - No MD5, SHA1, or unsalted hashing
```

**Pass Criteria:**
- ✅ Using bcrypt for hashing
- ✅ Using at least 10 rounds (we use 12)
- ✅ No weak algorithms (MD5, SHA1) for passwords
- ✅ No unsalted hashes

### 12.2 Sensitive Data Not Logged
**CVE/OWASP Risk:** CWE-532 (Insertion of Sensitive Information into Log File)

**How to Test:**
```bash
# Check logs for sensitive data
grep -i "password" /var/log/api/*.log
grep -i "token" /var/log/api/*.log
grep -i "email" /var/log/api/*.log

# Should find:
# ✅ Logged: "User logged in", "Password changed", etc.
# ❌ Not logged: actual passwords, token values, detailed PII
```

**Pass Criteria:**
- ✅ Passwords never logged
- ✅ Token values never logged
- ✅ User IDs okay to log (not PII)
- ✅ General messages okay ("Password reset requested")

### 12.3 PII Logging Appropriate
**CVE/OWASP Risk:** CWE-532 (Insertion of Sensitive Information into Log File), GDPR Article 32

**How to Test:**
```bash
# Review logging in auth.service.ts
grep -n "logger\|console" /packages/api/src/auth/auth.service.ts

# Should see:
# ✅ User ID in login logs
# ✅ Email in signup/reset logs (acceptable for audit)
# ✅ No password hashes in logs
# ✅ No full tokens in logs
```

**Pass Criteria:**
- ✅ Email logged only when necessary (signup, reset)
- ✅ User ID logged for audit trail
- ✅ No sensitive information beyond that
- ✅ Production logs sanitized

### 12.4 Error Messages Safe for Production
**CVE/OWASP Risk:** CWE-209 (Information Exposure)

**How to Test:**
```bash
# Make requests that trigger errors
curl -X POST http://localhost:3010/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid"}'

# Response should NOT contain:
# - TypeORM/database error messages
# - File paths or line numbers
# - Variable dumps
# - SQL queries
```

**Pass Criteria:**
- ✅ Generic error messages to client
- ✅ No stack traces
- ✅ No database internals exposed
- ✅ Detailed logs on server, not in HTTP responses

---

## 13. Test Execution Checklist

Use this checklist to track which tests have been run:

### Security Hardening Tests
- [ ] 1.1 Strong password requirements
- [ ] 1.2 Error message security (generic)
- [ ] 2.1 Login rate limiting (10/15min)
- [ ] 2.2 Signup rate limiting (5/15min)
- [ ] 2.3 Password reset rate limiting (3/15min)
- [ ] 3.1 Access token expiry (15min)
- [ ] 3.2 Refresh token expiry (7day)
- [ ] 3.3 Token payload security (no sensitive data)
- [ ] 3.4 Algorithm verification (HS256)
- [ ] 4.1 Reset token expiry (24hr)
- [ ] 4.2 Reset token one-time use
- [ ] 4.3 Email existence leak prevention
- [ ] 5.1 Verification token expiry (24hr)
- [ ] 5.2 Verification token one-time use
- [ ] 5.3 Pre-verification login block
- [ ] 6.1 Session creation on login
- [ ] 6.2 Session revocation on logout
- [ ] 6.3 Full logout (all sessions)
- [ ] 6.4 Session tracking (IP, User-Agent)
- [ ] 7.1 Email format validation
- [ ] 7.2 SQL injection prevention
- [ ] 7.3 XSS prevention
- [ ] 8.1 CORS allowed origins
- [ ] 8.2 HTTPS redirect
- [ ] 9.1 Login error messages (generic)
- [ ] 9.2 Password reset error messages
- [ ] 9.3 Signup error messages
- [ ] 9.4 No stack traces
- [ ] 10.1 Concurrent login performance
- [ ] 10.2 Token uniqueness
- [ ] 11.1 Foreign key constraints
- [ ] 11.2 Cascade delete
- [ ] 11.3 Password hash storage
- [ ] 11.4 Email uniqueness
- [ ] 11.5 Token hash storage
- [ ] 12.1 Bcrypt usage (12 rounds)
- [ ] 12.2 Sensitive data not logged
- [ ] 12.3 PII logging appropriate
- [ ] 12.4 Error messages safe

---

## Summary

This checklist covers all major security aspects of the authentication system:

1. **User Input** - Validated and sanitized
2. **Password Security** - Strong requirements, bcrypt storage
3. **Token Security** - JWT signed, expires appropriately, no sensitive data
4. **Session Security** - Tracked, revokable, per-device
5. **Attack Prevention** - Rate limiting, CORS, HTTPS, XSS/SQL injection filters
6. **Error Handling** - Generic, no information disclosure
7. **Logging** - Appropriate PII levels, no secrets
8. **Database** - Constraints, cascade delete, hashed storage
9. **Performance** - Load tested, no race conditions
10. **Compliance** - Bcrypt, GDPR-ready, audit trail

**Total Tests:** 40+ security test cases  
**Estimated Time:** 2-4 hours for full manual testing  
**Automation:** Use jest test suite for regression testing
