# Field Tool (Bluetooth Instrument) Integration

## What ships in this build

`bluetooth/FieldToolAdapter.kt` is the normalized contract every instrument brand implements:

```kotlin
interface FieldToolAdapter {
    val brandName: String
    fun connectionState(): Flow<ToolConnectionState>
    fun scan(): Flow<ToolDevice>
    suspend fun connect(device: ToolDevice)
    suspend fun disconnect()
    fun readings(jobId: String): Flow<ReadingSnapshot>
}
```

`ToolManager` (`bluetooth/ToolManager.kt`) is the facade the rest of the app talks to — it
holds one active adapter and exposes scan/connect/disconnect/readings without any screen
depending on a concrete vendor implementation.

Only `SimulatedToolAdapter` ships. It produces demo readings anchored on the values shown in
the approved WISE² Field Tech visual (118.4 / 352.1 psig, 39.6°F / 105.2°F saturation, etc.),
jittered slightly each emission, all flagged `isDemoData = true`.

## Why no real Fieldpiece adapter ships

Fieldpiece does not publish a public BLE protocol specification or SDK. The build spec (§9)
explicitly says: *"Do not invent undocumented Fieldpiece Bluetooth protocols. If direct
integration requires an unavailable SDK or undocumented protocol, preserve the abstraction and
implement a safe simulator/demo adapter."* That's exactly what this build does — the interface
is real and production-shaped, but no fabricated GATT service/characteristic UUIDs or packet
formats exist anywhere in this codebase.

## What's needed to add a real adapter

1. **Vendor SDK or protocol documentation.** Contact Fieldpiece (or the target brand) for
   developer/OEM access. Without documented GATT service UUIDs, characteristic UUIDs, and
   packet framing, any implementation would be reverse-engineered and could silently produce
   wrong readings — unacceptable for a tool technicians use to diagnose live refrigerant
   circuits.
2. **Runtime Bluetooth permissions.** The manifest already declares `BLUETOOTH_SCAN`
   (`neverForLocation`), `BLUETOOTH_CONNECT`, and the legacy `BLUETOOTH`/`BLUETOOTH_ADMIN`/
   `ACCESS_FINE_LOCATION` (`maxSdkVersion="30"`) pair for pre-Android-12 scanning. A real
   adapter still needs to request these at runtime before calling `BluetoothLeScanner.startScan`.
3. **A new adapter class**, e.g. `FieldpieceAdapter : FieldToolAdapter`, using
   `android.bluetooth.le.BluetoothLeScanner` for `scan()`, `BluetoothGatt` for `connect()`, and
   GATT characteristic notifications mapped into `ReadingSnapshot` for `readings()`. Every field
   the vendor doesn't supply must stay `null` — never fabricate a measurement (spec §10).
4. **Wire it into `AppContainer`**: swap `SimulatedToolAdapter()` for the new adapter (or add a
   brand picker in Settings if supporting multiple brands simultaneously).
5. **Reconnection handling.** `ToolConnectionState` already has a `RECONNECTING` state for this;
   a real adapter should transition through it on an unexpected GATT disconnect rather than
   silently dropping to `DISCONNECTED`.

## Adding a second brand later

Add another `FieldToolAdapter` implementation (`TestoAdapter`, `MeasureQuickAdapter`, ...) —
`ToolManager`, all repositories, and every screen are written against the interface only, so no
other code changes.
