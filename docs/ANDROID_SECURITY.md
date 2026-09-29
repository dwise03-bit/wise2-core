# WISE² Field Tech — Android Security

## Credential storage

- Access/refresh tokens and the cached user profile live only in
  `data/prefs/SecureTokenStore.kt`, an `EncryptedSharedPreferences` file
  (`AES256_SIV` key encryption, `AES256_GCM` value encryption, Keystore-backed `MasterKey`).
  No token is ever written to plain `SharedPreferences`, Room, or logs.
- `NetworkModule.kt`'s `HttpLoggingInterceptor` is capped at `Level.BASIC` in debug builds
  (method/URL/response-code only, no headers or bodies) and `Level.NONE` in release —
  it never logs request/response bodies, so the `Authorization` header and any PII in a
  request/response body never reach logcat.
- `android:allowBackup="false"` in the manifest, and `data_extraction_rules.xml` /
  `backup_rules.xml` additionally exclude the secure-prefs file and the Room DB by name as a
  defense-in-depth measure even if that ever changes.

## Network

- `network_security_config.xml` sets `cleartextTrafficPermitted="false"` at the base config —
  the app cannot make plaintext HTTP requests, full stop.
- APK updates are only ever downloaded from `apkUrl` values that start with `https://`
  (`UpdateManager.downloadAndVerify` rejects anything else before opening a connection).

## Auth lifecycle

- `TokenAuthenticator` (`data/remote/NetworkModule.kt`) intercepts a single 401, attempts a
  refresh via `POST /v1/auth/refresh`, and retries the original request once. A second 401
  after that (`responseCount(response) >= 2`) gives up and clears the stored session, which
  routes the user back to Login on next screen state read (`AuthRepository.isLoggedIn`).
- Logout (`AuthRepository.logout()`) calls `POST /v1/auth/logout` (revokes server-side
  sessions) before clearing local tokens — best-effort; local tokens are cleared even if the
  network call fails, so a technician can always log out even offline.

## Bluetooth / Camera / Location permissions

- Runtime permissions follow the Android 12+ split: `BLUETOOTH_SCAN`
  (`neverForLocation` flag — this app does not use BLE scan results for location) and
  `BLUETOOTH_CONNECT` for API 31+; the legacy `BLUETOOTH`/`BLUETOOTH_ADMIN`/
  `ACCESS_FINE_LOCATION` trio is capped at `maxSdkVersion="30"` for pre-12 devices, where
  BLE scanning constitutionally requires location permission at the OS level.
- `REQUEST_INSTALL_PACKAGES` is declared solely for the update flow's `ACTION_VIEW` install
  intent — the app never silently installs anything; Android's own installer UI always
  confirms with the user first.

## Explicitly out of scope for this build

- **Certificate pinning** is not implemented — the app trusts the system CA store
  (`network_security_config.xml`'s `<trust-anchors><certificates src="system" /></trust-anchors>`).
  Add OkHttp `CertificatePinner` in `NetworkModule.kt` if/when a specific pin set is decided.
- **Root/tamper detection** is not implemented.
- **Photo EXIF stripping** is not implemented — `CameraCaptureScreen.kt` saves whatever CameraX
  produces; if photos containing GPS EXIF data need to be scrubbed before upload, that's a
  follow-up in `JobRepository.attachPhoto` or the report-submission path.
