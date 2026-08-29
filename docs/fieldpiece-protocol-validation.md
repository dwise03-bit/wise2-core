# WISE² Fieldpiece BLE Protocol Validation

The iOS Tool Hub intentionally discovers and connects to recognized Fieldpiece device families without assuming proprietary service UUIDs or packet layouts.

## Physical validation procedure

1. Build a DEBUG configuration on a physical iPhone with Bluetooth permission granted.
2. Open Work > Fieldpiece Tool Hub and start scanning.
3. Power on one Fieldpiece tool at a time and connect it.
4. Observe `FIELDPIECE_CAPTURE` records in the Xcode console while changing exactly one known physical measurement.
5. Record the advertised service UUIDs, discovered service/characteristic UUID, characteristic properties and payload bytes.
6. Compare repeated payload changes against the physical instrument and the official Job Link display.
7. Only after the same mapping is repeatable across multiple values and reconnects, add a `FieldpieceProtocolProfile` decoder.
8. Add regression fixtures/tests for every verified packet format before enabling live normalized readings.

## Safety rules

- Never infer an HVAC measurement from an unknown packet.
- Never upload captures automatically.
- Do not persist CoreBluetooth peripheral identifiers in protocol documentation.
- Keep captures local until sanitized.
- Validate scale, sign, byte order, units and invalid/sentinel values independently.
- Re-test after Fieldpiece firmware changes.

## Initial target families

- JL3PR pressure probes
- JL3PC pipe clamps
- JL3RH psychrometers
- JL3MN manometers
- SMAN manifolds
- Supported wireless electrical meters

The production decoder registry starts empty by design. Unknown or unverified characteristics return zero `ToolReading` values.
