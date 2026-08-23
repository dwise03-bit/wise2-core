# WISE² HVAC Field Agent — Privacy & Data Collection Map

**Purpose**: Compliance with Google Play's Data Safety section and GDPR/CCPA requirements.

---

## Data Categories & Collection Methods

### 1. Account Information

| Data | Collected | Transmitted | Stored Locally | Stored on Server | Encrypted | Required | Deletable | Purpose |
|------|-----------|-------------|-----------------|------------------|-----------|----------|-----------|---------|
| Email | ✅ Yes | ✅ Yes (HTTPS) | ✅ Device storage | ✅ Yes | ✅ AES-256 | ✅ Yes | Login & identification | ✅ Yes |
| Password | ✅ Yes | ✅ Yes (HTTPS, hashed) | ❌ Never | ❌ Never sent | ✅ Hashed on server | ✅ Yes | Authentication | N/A |
| JWT Access Token | ✅ Yes | ✅ Yes (HTTPS) | ✅ Device storage | ❌ Not stored | ✅ AES-256 | ✅ Yes | Session auth | ✅ Yes (on logout) |
| JWT Refresh Token | ✅ Yes | ✅ Yes (HTTPS) | ✅ Device storage | ❌ Not stored | ✅ AES-256 | ✅ Yes | Token refresh | ✅ Yes (on logout) |
| Name | ✅ Yes | ✅ Yes (HTTPS) | ✅ Device storage | ✅ Yes | ✅ HTTPS | ❌ No | Personalization | ✅ Yes |
| Google OAuth ID Token | ✅ Yes (if Google login) | ✅ Yes (HTTPS) | ❌ Temporary only | ❌ Not stored | ✅ HTTPS | ❌ Optional | Google authentication | ✅ Yes (after login) |

**Encryption Details**:
- Local: EncryptedSharedPreferences (Android Keystore-backed, AES-256-GCM)
- Transit: HTTPS/TLS 1.2+
- Server: [Backend team responsibility]

---

### 2. Customer & Job Information

| Data | Collected | Transmitted | Stored Locally | Stored on Server | Encrypted | Required | Deletable | Purpose |
|------|-----------|-------------|-----------------|------------------|-----------|----------|-----------|---------|
| Customer name | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Service records | ✅ Yes |
| Customer phone | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Contact | ✅ Yes |
| Customer address | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Service location | ✅ Yes |
| Job complaint/notes | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Diagnostics | ✅ Yes |
| Job status/history | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Workflow tracking | ✅ Yes |

**Note**: Customer data is accessible only to the technician's login and their team (controlled by backend permissions).

---

### 3. Equipment Information

| Data | Collected | Transmitted | Stored Locally | Stored on Server | Encrypted | Required | Deletable | Purpose |
|------|-----------|-------------|-----------------|------------------|-----------|----------|-----------|---------|
| Equipment type | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Identification | ✅ Yes |
| Manufacturer/model | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Reference | ✅ Yes |
| Serial number | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Warranty tracking | ✅ Yes |
| Refrigerant type | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Safety (diagnostic) | ✅ Yes |
| Tonnage/voltage/phase | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Specs (diagnostic) | ✅ Yes |
| Service history | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ✅ Yes | Maintenance tracking | ✅ Yes |

---

### 4. Diagnostic & Measurement Data

| Data | Collected | Transmitted | Stored Locally | Stored on Server | Encrypted | Required | Deletable | Purpose |
|------|-----------|-------------|-----------------|------------------|-----------|----------|-----------|---------|
| Pressure readings | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ❌ No | Diagnostic analysis | ✅ Yes |
| Temperature readings | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ❌ No | Diagnostic analysis | ✅ Yes |
| Voltage/current readings | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ❌ No | Electrical analysis | ✅ Yes |
| Diagnostic workflow state | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ❌ No | Analysis tracking | ✅ Yes |
| Calculated values (superheat, etc.) | ✅ Yes | ✅ Yes (HTTPS) | ✅ Room DB | ✅ Yes | ✅ HTTPS | ❌ No | Analysis output | ✅ Yes |

**Note**: Measurements are stored with the job record. Customer does not see raw measurement data unless technician includes it in report.

---

### 5. Photos

| Data | Collected | Transmitted | Stored Locally | Stored on Server | Encrypted | Required | Deletable | Purpose |
|------|-----------|-------------|-----------------|------------------|-----------|----------|-----------|---------|
| Service photos (compressed) | ✅ Yes (via CameraX) | ✅ Yes (HTTPS) | ✅ App storage | ✅ Yes (if attached to report) | ✅ HTTPS | ❌ No | Equipment documentation | ✅ Yes |
| Photo metadata (location, etc.) | ❌ No | N/A | N/A | N/A | N/A | N/A | N/A | Not captured |

**Note**: Camera permission requested but optional. No location data extracted from photos.

---

### 6. Device & Connectivity Information

| Data | Collected | Transmitted | Stored Locally | Stored on Server | Encrypted | Required | Deletable | Purpose |
|------|-----------|-------------|-----------------|------------------|-----------|----------|-----------|---------|
| Device model | ❌ No (not collected) | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Approximate location (connectivity check) | ❌ No (not collected) | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Bluetooth device MAC | ✅ Yes (if Bluetooth enabled) | ❌ No (local only) | ✅ Temporary (current session) | ❌ Never | N/A | ❌ No | Instrument connection | ✅ Yes (on disconnect) |
| Network connectivity status | ✅ Yes (local check) | ❌ No | ✅ Temporary (current session) | ❌ Never | N/A | ❌ No | Sync eligibility | ✅ Yes (automatic) |

---

### 7. AI/IMP Chat

| Data | Collected | Transmitted | Stored Locally | Stored on Server | Encrypted | Required | Deletable | Purpose |
|------|-----------|-------------|-----------------|------------------|-----------|----------|-----------|---------|
| IMP chat prompt | ✅ Yes | ✅ Yes (HTTPS) | ✅ Cache (temporary) | ✅ Yes (Hermes logs) | ✅ HTTPS | ❌ No | AI assistance | ✅ Yes |
| IMP chat response | ✅ Yes | ✅ Yes (HTTPS) | ✅ Cache (temporary) | ✅ Yes (Hermes logs) | ✅ HTTPS | ❌ No | Technician guidance | ✅ Yes |
| Context (job/equipment/readings sent to IMP) | ✅ Yes | ✅ Yes (HTTPS) | ✅ Cache (temporary) | ✅ Yes (Hermes logs) | ✅ HTTPS | ❌ No | AI context | ✅ Yes |

**Limitation**: IMP chat history is available to the technician's account only. Other team members do not see the conversation unless explicitly shared.

---

### 8. App Performance & Crash Data

| Data | Collected | Transmitted | Stored Locally | Stored on Server | Encrypted | Required | Deletable | Purpose |
|------|-----------|-------------|-----------------|------------------|-----------|----------|-----------|---------|
| Crash stack traces | ❌ No (not implemented in v1.0) | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| App performance metrics | ❌ No (not implemented in v1.0) | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Event analytics | ❌ No (not implemented in v1.0) | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

**Note**: v1.0 does not include analytics or crash reporting. Can be added in v1.1+ with opt-in consent.

---

## Data Retention Policies

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| **Session tokens** | Until logout or expiry (24h) | Immediate on logout |
| **Encrypted tokens (device storage)** | Until logout or app uninstall | Clear via Settings → Logout |
| **Jobs & customer records** | Until deleted by technician or team admin | Delete button in job detail (syncs to server) |
| **Equipment profiles** | Until deleted by technician or team admin | Delete button in equipment detail (syncs to server) |
| **Measurements & diagnostic data** | Until job is deleted | Deleted with job (cascading delete in database) |
| **Service reports** | Until deleted by technician | Delete button in report (syncs to server) |
| **IMP chat history** | Until app data cleared or account deleted | Clear app cache or factory reset device; server retention per Hermes policy |
| **Photos** | Until deleted by technician | Delete button in job (removes local + server copies) |

---

## Third-Party Data Sharing

| Service | Data Shared | Purpose | Opt-In/Opt-Out |
|---------|-------------|---------|----------------|
| **Google OAuth** | Email (Google ID token) | Optional login | ✅ Opt-in (user chooses Google login) |
| **Hermes/IMP** | Job context + chat prompt | AI assistance | ✅ Opt-in (user initiates chat) |
| **WISE² Backend** | All above (via API) | Cloud sync | ✅ Opt-in (user enables sync) |
| **Fieldpiece/tools** | Instrument readings | Live measurements | ✅ Opt-in (user connects Bluetooth) |

**No data is shared with advertisers, data brokers, or third parties for profiling.**

---

## Data Access & Deletion

### User-Initiated Deletion

Users can delete:
- Individual jobs (Settings → Job History)
- Individual equipment profiles (Equipment screen)
- Individual reports (Report detail screen)
- Chat history (IMP screen → Clear history)
- All local data (Settings → Clear app data)

### Account Deletion

Procedure to be implemented:
1. User requests account deletion from Settings
2. App sends DELETE request to backend with authorization
3. Backend deletes all user data within 30 days
4. Confirmation email sent to user

---

## GDPR/CCPA Compliance

### Rights Provided

- ✅ **Access**: Export job data via reports or via API request
- ✅ **Portability**: Service records are standard JSON/PDFs
- ✅ **Deletion**: User can delete individual records or request full account deletion
- ✅ **Correction**: Edit customer, equipment, and notes in app
- ✅ **Restriction**: No profiling or algorithmic decision-making

### Data Breach Notification

In the event of a data breach:
1. WISE² will investigate within 72 hours
2. Affected users will be notified via email
3. Notification will include: scope of breach, data affected, steps taken to secure
4. For EU residents: Notification to relevant supervisory authority within 72 hours

---

## Conclusion

**WISE² HVAC Field Agent collects and stores only data necessary for field HVAC service work.** No behavioral tracking, profiling, or unnecessary third-party sharing occurs. Users maintain full control over their data and can delete at any time.

