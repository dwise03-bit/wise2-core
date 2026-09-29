# Google Play — Data Safety Worksheet

**App**: WISE² HVAC Field Agent  
**Package ID**: `com.wise2.fieldtech`  
**Version**: 1.0.0  

---

## A. Data Collection

### Does your app collect or request any personal or sensitive user data?

**YES**

### If yes, select all categories collected or shared:

#### User Data Categories

**Identity**
- ✅ Name
- ✅ Email address
- ❌ User IDs
- ❌ Phone number (collected but not transmitted or stored with account)
- ❌ Date of birth
- ❌ Address

**Commercial Information**
- ✅ Purchase history (job/equipment records for billing reference)
- ❌ Financial information
- ❌ Payment information

**Location**
- ❌ Approximate location (not collected)
- ❌ Precise location (not collected)

**Contacts**
- ✅ Customer contact info (name, phone, address — collected for service records)

**Calendar & Events**
- ❌ Not collected

**Photos & Videos**
- ✅ Photos (captured for service documentation)

**Audio & Recordings**
- ❌ Audio recordings (not implemented in v1.0)

**Files & Documents**
- ❌ Not collected

**App Activity & Performance**
- ❌ App crashes (not implemented in v1.0)
- ❌ Performance metrics (not implemented in v1.0)
- ❌ Diagnostic logs (not implemented in v1.0)

**Device or Identifiers**
- ❌ Device ID/IMEI
- ❌ Advertising ID
- ✅ Bluetooth device identifiers (for instrument connection only)

**Biometrics**
- ❌ Not collected

**Health & Fitness**
- ❌ Not collected

**Financial**
- ❌ Not collected (notes in job records may reference parts cost, but cost data itself is not stored)

**Messages**
- ✅ Messages within IMP chat (transmitted to Hermes API for AI assistance)

**Sensitive Information**
- ✅ Notes about equipment condition or customer situation (stored in job/notes fields)

---

## B. Data Protection

### Is the collected data encrypted during transmission?

**YES**

**Transmission Method**: HTTPS/TLS 1.2+

### Is the collected data encrypted when stored?

**Partially**

**Details**:
- **Authentication tokens**: ✅ Encrypted (AES-256-GCM via Android Keystore)
- **Customer/job/equipment data**: ⚠️ Encrypted in transit (HTTPS); encryption at rest depends on device (full-disk encryption if device is locked)
- **Photos**: ⚠️ Compressed and stored in app directory; encryption depends on device setup

### Can users request that their data be deleted?

**YES**

**Process**:
1. Individual items: Delete via UI (jobs, equipment, photos, etc.)
2. All account data: Settings → Account → Request account deletion
3. Response time: Within 30 days of request
4. Manual deletion: Settings → App Storage → Clear app data (deletes local copy)

### Is your app COPPA-compliant (if it targets children)?

**NOT APPLICABLE** — App is for professional HVAC technicians, not children.

---

## C. Data Sharing

### Does your app share user data with third parties?

**YES, Limited**

### If yes, which third parties receive which data?

| Third Party | Data Shared | Purpose | Required? |
|-------------|------------|---------|-----------|
| **Hermes/IMP** | Job context, chat message | AI technician support | No (opt-in) |
| **Google** | Email, OAuth token | Google Sign-In option | No (opt-in) |
| **WISE² Backend** | All (jobs, equipment, readings, photos, reports) | Cloud sync & storage | No (opt-in, but app encourages) |
| **Fieldpiece API** | Instrument readings | Live measurements | No (opt-in) |

### Is data shared with advertising networks?

**NO**

### Is data sold to third parties?

**NO**

### Is data used for algorithmic decision-making or profiling?

**NO**

---

## D. Security Practices

### Does the app use secure user authentication?

**YES**

**Methods**:
- Email/password with JWT tokens
- Google OAuth (optional)
- Token refresh mechanism (auto-refresh on 401)

### Does the app validate SSL certificates?

**YES**

**Configuration**: Network security config enforces:
- No clear-text HTTP (only HTTPS)
- Standard certificate validation via system trust store

### Does the app implement API endpoint authentication?

**YES**

**Method**: Bearer token (JWT) in Authorization header

### Does the app implement any client-side security?

**YES**

- Encrypted token storage (EncryptedSharedPreferences)
- No credentials logged
- No sensitive data in URLs or parameters
- Permission checks before camera/Bluetooth access

---

## E. Data Practices

### Does the app collect data?

**YES**

### What is the primary purpose of data collection?

HVAC field service work: managing jobs, equipment records, measurements, diagnostics, service reports.

### Does data collection comply with applicable laws (GDPR, CCPA, etc.)?

**YES, with User Responsibility**

**Shared Responsibility**:
- **WISE²**: Implements technical controls (encryption, deletion, audit logs on backend)
- **User (Technician/Company)**: Responsible for obtaining customer consent per GDPR Article 21, data processing agreements, etc.

**Recommendation**: Include in terms of service that technicians have obtained customer consent or have legitimate interest for storing service records.

### Is there a privacy policy that users can access?

**YES, Required**

**Location**: To be hosted at `https://wise2.net/privacy` before launch

---

## F. Developer Contact & Support

**Developer Name**: WISE² Inc.  
**Contact Email**: dwise03@gmail.com (CHANGE to support@wise2.net before launch)  
**Support Page**: https://wise2.net/support  
**Privacy Policy**: https://wise2.net/privacy (to be created)  
**Terms of Service**: https://wise2.net/terms (to be created)

---

## G. Answers to Standard Google Play Questions

### Security & Privacy

**1. Does your app collect, share, or require access to sensitive data (health, financial, location, etc.)?**

Partially. App collects job/customer/equipment records necessary for HVAC service work, but does not collect health, precise location, or financial data. Customer consent is the responsibility of the technician/company using the app.

**2. Is your app designed for children (under 13)?**

No. App is a professional HVAC field service tool.

**3. Does your app use encryption for data in transit and at rest?**

Data in transit: Yes (HTTPS/TLS 1.2+).  
Data at rest: Tokens are encrypted; customer/job data depends on device encryption.

**4. Do you request unnecessary permissions?**

No. Permissions requested are:
- CAMERA: For service photos (optional)
- BLUETOOTH_SCAN / BLUETOOTH_CONNECT: For instrument integration (optional)
- INTERNET: For API sync (required)
- POST_NOTIFICATIONS: For sync updates (optional)
- RECORD_AUDIO: Reserved for future voice notes (optional)

**5. Can users delete their data?**

Yes. Users can delete individual jobs/equipment/reports via the app, or request full account deletion via Settings.

**6. Do you comply with Google Play policies?**

Yes.
- No ads, malware, or deceptive practices
- Transparent data practices
- Secure authentication
- Respect user privacy

---

## Changes for Production Launch

Before submission, ensure:

- [ ] Privacy policy is hosted and accessible at `https://wise2.net/privacy`
- [ ] Terms of service are created and hosted
- [ ] Support contact is `support@wise2.net` (not personal email)
- [ ] Backend team confirms encryption at rest for stored data
- [ ] Backend team confirms 30-day data deletion SLA
- [ ] App is tested on physical devices (Razr 2025, other common models)
- [ ] No hardcoded test credentials remain in code

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-23 | Initial data safety worksheet |

