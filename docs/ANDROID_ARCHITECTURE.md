# WISE² Field Tech — Android Architecture

**Module**: `apps/fieldtech-android/`
**Package**: `com.wise2.fieldtech`

## Layering

```
Compose UI (ui/screens/*)
    ↓
ViewModels (one per screen, plain androidx.lifecycle.ViewModel)
    ↓
Repositories (data/repository/*) — offline-first: Room first, network best-effort
   ↙                                              ↘
Room (data/local)                          Retrofit → WISE² API (data/remote)
```

Domain models (`domain/model/*`) are plain Kotlin data classes with no Android or
serialization dependencies — the same `Job`, `Equipment`, `ReadingSnapshot` etc. are used by
UI, Room (via a `toEntity()`/`toDomain()` mapper per repository file), and the network layer
(via a `toDto()`/DTO mapper). Nothing in `domain/` imports `android.*`.

## Why no DI framework

The build spec's preferred stack (Kotlin, Compose, Retrofit, Room, WorkManager, CameraX,
Bluetooth) doesn't call for Hilt/Dagger, and skipping an annotation-processor-based DI
framework keeps the KSP/kapt surface — and therefore build risk — smaller for this first
build, verified only via a headless Docker Gradle build with no on-device iteration loop
available (see `docs/ANDROID_IMPLEMENTATION_AUDIT.md` §3). `di/AppContainer.kt` is a single
hand-written singleton that owns every repository/manager and is exposed via
`(application as WiseFieldTechApp).container`. `ui/navigation/WiseNavGraph.kt` wires each
screen's ViewModel using `androidx.lifecycle.viewmodel.viewModelFactory { initializer { ... } }`
pulling dependencies straight from the container — no reflection, no generated code.

If the app grows past a handful of engineers, migrating to Hilt is a mechanical follow-up:
`AppContainer`'s public `val`s map almost 1:1 to what would become `@Provides` methods.

## Package map

| Package | Contents |
|---|---|
| `domain/model` | Plain data classes — Job, Equipment, ReadingSnapshot, Diagnostic*, JobReport, User, ImpMessage, AppUpdateInfo |
| `domain/calc` | `HvacCalculations` — pure functions for superheat/subcooling/temp split/imbalance, each returning inputs+method+result+timestamp |
| `domain/diagnose` | `DiagnosticTrees` (static troubleshooting trees) + `DiagnosticEngine` (pure state-machine advance function) |
| `data/local` | Room `AppDatabase`, entities, DAOs |
| `data/remote` | Retrofit `ApiService`, DTOs, `NetworkModule` (OkHttp/Retrofit wiring, auth interceptor, token authenticator) |
| `data/repository` | One repository per feature area, offline-first |
| `data/prefs` | `SecureTokenStore` (EncryptedSharedPreferences) and `UserPreferences` (DataStore) |
| `data/sync` | `SyncWorker` — drains the offline write queue |
| `bluetooth` | `FieldToolAdapter` interface, `SimulatedToolAdapter`, `ToolManager` facade |
| `camera` | CameraX capture screen |
| `update` | `UpdateManager` — version check, download, SHA-256 verify, installer handoff |
| `ui/theme`, `ui/components`, `ui/navigation`, `ui/screens/*` | Compose UI |

## Testing

Unit tests target the pure layers first (`domain/calc`, `domain/diagnose`) since they need no
Android framework and run under plain JVM JUnit — see
`app/src/test/kotlin/com/wise2/fieldtech/domain/`. Run with:

```bash
./gradlew test
```

## Build verification without a local Android SDK

This development machine has no Android SDK/emulator installed. `apps/fieldtech-android/ci/`
holds a Dockerfile (`android-build.Dockerfile`) that provides JDK 17 + Gradle 8.7 +
`platforms;android-34` + `build-tools;34.0.0` — enough to run `./gradlew test` and
`assembleDebug` headlessly. It cannot run an emulator or replace on-device visual verification.

```bash
# --platform linux/amd64 is required on Apple Silicon: AGP's aapt2 binary is x86_64-only and
# fails under Rosetta inside a native arm64 container (missing /lib64/ld-linux-x86-64.so.2).
docker build --platform linux/amd64 -t wise2-fieldtech-android-build -f ci/android-build.Dockerfile apps/fieldtech-android
docker run --rm --platform linux/amd64 -v "$(pwd)/apps/fieldtech-android":/project -w /project \
  wise2-fieldtech-android-build gradle --no-daemon test assembleDebug
```
