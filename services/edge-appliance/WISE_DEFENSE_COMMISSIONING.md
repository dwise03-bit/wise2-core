# Wise Defense Edge Commissioning

Target wiring:

- Heltec V3 / Meshtastic connected to the K10-side edge host.
- RTL-SDR (or separately supported receiver) connected to the Raspberry Pi edge host.

The edge gateway is receive-only for SDR and does not transmit or bridge traffic to GMRS/HAM.

## Before connecting hardware

1. Deploy the Wise Defense API and its prerequisite tenant schema. Do not enable the gateway against the current legacy production database.
2. Create the real Wise Defense tenant, owner membership, and an enrolled edge gateway with a revocable token.
3. Copy `.env.example` to `.env` on each edge host and set only real values.

## Heltec V3

After connecting the Heltec, resolve its stable path:

```bash
ls -l /dev/serial/by-id
```

Set the discovered path—not a guessed `/dev/ttyUSB*` or `/dev/ttyACM*` value:

```dotenv
WISE_DEFENSE_GATEWAY_ENABLED=true
MESHTASTIC_CONNECTION_TYPE=serial
MESHTASTIC_SERIAL_PORT=/dev/serial/by-id/<actual-device>
```

## Raspberry Pi SDR

Connect the receiver and set the actual type:

```dotenv
SDR_ENABLED=true
SDR_DEVICE_TYPE=rtl-sdr
```

Start the edge overlay:

```bash
docker compose -f docker-compose.yml -f docker-compose.wise-defense.yml up -d
```

Validate without transmitting or capturing communications:

```bash
curl http://localhost:3000/wise-defense/hardware
```

Expected states are `ACTIVE`, `DETECTED_NOT_CONFIGURED`, `MISSING_CREDENTIAL`, `MISSING_HARDWARE`, or `DISABLED`. Do not mark a component operational until gateway enrollment and end-to-end health checks are complete.
