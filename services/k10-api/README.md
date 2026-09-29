# WISE² K10 API Client

**Status**: Production-ready  
**Device**: UNIHIKER K10 (ESP32-S3, 240x320 ILI9341 display)  
**Integration**: Discord bot `/edge k10` commands

---

## Quick Start

### Installation

```bash
cd services/k10-api
npm install
```

### Configuration

Set the K10 device IP address:

```bash
# In .env or environment
export K10_API_URL=http://192.168.1.100:5000
```

### Usage

```javascript
const K10Client = require('./k10-client');

const k10 = new K10Client({
  baseURL: 'http://192.168.1.100:5000',
  timeout: 10000,
  retries: 2,
});

// Get device status
const status = await k10.getStatus();

// Get full device info
const info = await k10.getDeviceInfo();

// Test display
const test = await k10.testDisplay('color_bars');

// Get WiFi status
const wifi = await k10.getWiFi();

// Test microphone
const mic = await k10.testMicrophone(3);

// Sync with dashboard
const sync = await k10.sync({ timestamp: Date.now() });
```

---

## API Methods

### `getStatus()`
Get device status (online/offline)

**Returns:**
```javascript
{
  status: 'online' | 'offline',
  error: String
}
```

### `getDisplay()`
Get display status

**Returns:**
```javascript
{
  display: String,
  error: String
}
```

### `testDisplay(pattern)`
Test display with a pattern

**Parameters:**
- `pattern` (String): `'color_bars'`, `'grid'`, `'animation'`

**Returns:**
```javascript
{
  success: Boolean,
  error: String
}
```

### `getWiFi()`
Get WiFi connection status

**Returns:**
```javascript
{
  connected: Boolean,
  ssid: String,
  signal: Number (0-100),
  ip: String,
  error: String
}
```

### `testMicrophone(duration)`
Test microphone for specified duration

**Parameters:**
- `duration` (Number): Seconds to record (default: 3)

**Returns:**
```javascript
{
  success: Boolean,
  duration: Number,
  error: String
}
```

### `getMetrics()`
Get device metrics (CPU, memory, temperature)

**Returns:**
```javascript
{
  cpu: Number (0-100),
  memory: Number (0-100),
  temperature: Number,
  error: String
}
```

### `sync(data)`
Sync data with K10 dashboard

**Parameters:**
- `data` (Object): Data to sync (e.g., `{ timestamp, source }`)

**Returns:**
```javascript
{
  success: Boolean,
  error: String
}
```

### `getDeviceInfo()`
Get complete device information (calls all methods in parallel)

**Returns:**
```javascript
{
  online: Boolean,
  status: String,
  firmware: String,
  display: String,
  wifi: Object,
  metrics: Object,
  error: String
}
```

---

## Discord Integration

The K10 client is integrated with the Discord bot's `/edge k10` command:

```bash
/edge k10 action:status        # Get device status
/edge k10 action:display_test  # Test display
/edge k10 action:wifi          # Get WiFi status
/edge k10 action:mic_test      # Test microphone
/edge k10 action:sync          # Sync dashboard
```

Each action returns a Discord embed with real device data.

---

## Testing

```bash
# Run tests
npm test

# Test with specific endpoint
K10_API_URL=http://192.168.1.100:5000 npm test
```

---

## Network Configuration

### K10 Device Setup

1. Flash firmware to K10 device
2. Configure K10 WiFi connection
3. Note K10 IP address (default: 192.168.1.100)
4. Verify K10 HTTP API is running on port 5000

### Discord Bot Setup

1. Set `K10_API_URL` environment variable
2. Deploy Discord bot
3. Register `/edge` command
4. Test `/edge k10 action:status`

---

## Error Handling

The client includes automatic retry logic:

- **Retries**: 2 attempts per request (configurable)
- **Timeout**: 10 seconds per request (configurable)
- **Graceful Degradation**: Returns error object instead of throwing

---

## Future Enhancements

- [ ] Firmware update via API
- [ ] Remote configuration
- [ ] Voice control integration
- [ ] Sensor data logging
- [ ] Device registry (multiple K10s)

---

**Last Updated**: 2026-09-16  
**Author**: WISE² Discord Integration
