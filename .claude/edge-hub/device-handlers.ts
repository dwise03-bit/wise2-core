/**
 * WISE² Edge Hub - Device-Specific Handlers
 *
 * Type-specific command processors for:
 * - BYTE Mini CYD (2.4" touchscreen)
 * - XIAO ESP32-S3 (sensor node)
 * - ESP32-C5 (multi-protocol gateway)
 */

import mqtt, { MqttClient } from 'mqtt';

export interface DeviceCommand {
  deviceId: string;
  command: string;
  args?: Record<string, any>;
}

export interface DisplayUpdate {
  text?: string;
  image?: string;
  color?: string;
  x?: number;
  y?: number;
}

/**
 * BYTE Mini CYD Handler - Display and UI commands
 */
export class ByteMiniCydHandler {
  constructor(private client: MqttClient) {}

  /**
   * Update display text
   */
  async updateDisplay(deviceId: string, update: DisplayUpdate): Promise<void> {
    const payload = {
      action: 'display_update',
      ...update,
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }

  /**
   * Show status message (common use case)
   */
  async showStatus(deviceId: string, message: string, duration?: number): Promise<void> {
    await this.updateDisplay(deviceId, {
      text: message,
      x: 20,
      y: 80,
      color: '#00D4FF',
    });

    if (duration) {
      setTimeout(() => {
        this.updateDisplay(deviceId, { text: '' });
      }, duration);
    }
  }

  /**
   * Show listening indicator (for voice)
   */
  async showListening(deviceId: string): Promise<void> {
    await this.updateDisplay(deviceId, {
      text: '🎤 Listening...',
      x: 20,
      y: 100,
      color: '#4ADE80',
    });
  }

  /**
   * Show thinking indicator (processing)
   */
  async showThinking(deviceId: string): Promise<void> {
    await this.updateDisplay(deviceId, {
      text: '⏳ Processing...',
      x: 20,
      y: 100,
      color: '#FBBF24',
    });
  }

  /**
   * Show error
   */
  async showError(deviceId: string, error: string): Promise<void> {
    await this.updateDisplay(deviceId, {
      text: `❌ ${error}`,
      x: 20,
      y: 100,
      color: '#EF4444',
    });
  }

  /**
   * Clear display
   */
  async clearDisplay(deviceId: string): Promise<void> {
    await this.updateDisplay(deviceId, { text: '' });
  }
}

/**
 * XIAO ESP32-S3 Handler - Sensor node
 */
export class XiaoEsp32S3Handler {
  constructor(private client: MqttClient) {}

  /**
   * Request sensor reading
   */
  async readSensor(
    deviceId: string,
    sensorType: 'temperature' | 'humidity' | 'light' | 'motion'
  ): Promise<void> {
    const payload = {
      action: 'sensor_read',
      sensor: sensorType,
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }

  /**
   * Set LED color (for status indication)
   */
  async setLed(deviceId: string, color: string): Promise<void> {
    const payload = {
      action: 'led_set',
      color, // Format: '#RRGGBB' or 'red', 'green', 'blue'
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }

  /**
   * Enable/disable sensor
   */
  async setSensorState(
    deviceId: string,
    sensorType: string,
    enabled: boolean
  ): Promise<void> {
    const payload = {
      action: 'sensor_set',
      sensor: sensorType,
      enabled,
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }
}

/**
 * ESP32-C5 Handler - Multi-protocol gateway
 */
export class Esp32C5Handler {
  constructor(private client: MqttClient) {}

  /**
   * Scan for BLE devices
   */
  async scanBLE(deviceId: string, durationMs: number = 5000): Promise<void> {
    const payload = {
      action: 'ble_scan',
      duration_ms: durationMs,
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }

  /**
   * Connect to BLE device
   */
  async connectBLE(deviceId: string, targetMac: string): Promise<void> {
    const payload = {
      action: 'ble_connect',
      target_mac: targetMac,
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }

  /**
   * Set WiFi AP (for other devices to connect)
   */
  async configWiFiAP(
    deviceId: string,
    ssid: string,
    password?: string,
    channel?: number
  ): Promise<void> {
    const payload = {
      action: 'wifi_ap_set',
      ssid,
      password,
      channel,
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }

  /**
   * Connect as WiFi client
   */
  async connectWiFi(deviceId: string, ssid: string, password: string): Promise<void> {
    const payload = {
      action: 'wifi_sta_set',
      ssid,
      password,
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }

  /**
   * Proxy MQTT over BLE (for devices without WiFi)
   */
  async enableBLEProxy(deviceId: string, targetMac: string): Promise<void> {
    const payload = {
      action: 'ble_proxy_start',
      target_mac: targetMac,
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }

  /**
   * Get gateway status
   */
  async getStatus(deviceId: string): Promise<void> {
    const payload = {
      action: 'status_get',
      timestamp: Date.now(),
    };

    this.client.publish(`wise2/device/${deviceId}/command`, JSON.stringify(payload), {
      qos: 1,
    });
  }
}

/**
 * Device Handler Router - Dispatches commands to appropriate handler
 */
export class DeviceHandlerRouter {
  private byteHandlers = new Map<string, ByteMiniCydHandler>();
  private xiaoHandlers = new Map<string, XiaoEsp32S3Handler>();
  private esp32c5Handlers = new Map<string, Esp32C5Handler>();

  constructor(private client: MqttClient) {}

  /**
   * Get handler for device type
   */
  getHandler(
    deviceId: string,
    deviceType: string
  ): ByteMiniCydHandler | XiaoEsp32S3Handler | Esp32C5Handler | null {
    switch (deviceType) {
      case 'byte-mini-cyd':
        if (!this.byteHandlers.has(deviceId)) {
          this.byteHandlers.set(deviceId, new ByteMiniCydHandler(this.client));
        }
        return this.byteHandlers.get(deviceId) || null;

      case 'xiao-esp32s3':
        if (!this.xiaoHandlers.has(deviceId)) {
          this.xiaoHandlers.set(deviceId, new XiaoEsp32S3Handler(this.client));
        }
        return this.xiaoHandlers.get(deviceId) || null;

      case 'esp32-c5':
        if (!this.esp32c5Handlers.has(deviceId)) {
          this.esp32c5Handlers.set(deviceId, new Esp32C5Handler(this.client));
        }
        return this.esp32c5Handlers.get(deviceId) || null;

      default:
        return null;
    }
  }

  /**
   * Route device command
   */
  async handleCommand(deviceId: string, deviceType: string, command: DeviceCommand): Promise<void> {
    const handler = this.getHandler(deviceId, deviceType);

    if (!handler) {
      console.warn(`[Handlers] No handler for device type: ${deviceType}`);
      return;
    }

    console.log(`[Handlers] Routing command ${command.command} to ${deviceType}`);

    // Type-safe dispatch based on device type
    if (deviceType === 'byte-mini-cyd' && handler instanceof ByteMiniCydHandler) {
      await this.dispatchByteCommand(handler, command);
    } else if (deviceType === 'xiao-esp32s3' && handler instanceof XiaoEsp32S3Handler) {
      await this.dispatchXiaoCommand(handler, command);
    } else if (deviceType === 'esp32-c5' && handler instanceof Esp32C5Handler) {
      await this.dispatchEsp32c5Command(handler, command);
    }
  }

  private async dispatchByteCommand(
    handler: ByteMiniCydHandler,
    command: DeviceCommand
  ): Promise<void> {
    switch (command.command) {
      case 'display_update':
        await handler.updateDisplay(command.deviceId, command.args as DisplayUpdate);
        break;
      case 'show_status':
        await handler.showStatus(command.deviceId, command.args?.message || '');
        break;
      case 'show_listening':
        await handler.showListening(command.deviceId);
        break;
      case 'show_thinking':
        await handler.showThinking(command.deviceId);
        break;
      case 'show_error':
        await handler.showError(command.deviceId, command.args?.error || '');
        break;
      case 'clear':
        await handler.clearDisplay(command.deviceId);
        break;
    }
  }

  private async dispatchXiaoCommand(
    handler: XiaoEsp32S3Handler,
    command: DeviceCommand
  ): Promise<void> {
    switch (command.command) {
      case 'read_sensor':
        await handler.readSensor(command.deviceId, command.args?.sensor || 'temperature');
        break;
      case 'set_led':
        await handler.setLed(command.deviceId, command.args?.color || 'blue');
        break;
      case 'set_sensor':
        await handler.setSensorState(
          command.deviceId,
          command.args?.sensor || 'motion',
          command.args?.enabled || true
        );
        break;
    }
  }

  private async dispatchEsp32c5Command(
    handler: Esp32C5Handler,
    command: DeviceCommand
  ): Promise<void> {
    switch (command.command) {
      case 'ble_scan':
        await handler.scanBLE(command.deviceId, command.args?.duration_ms);
        break;
      case 'ble_connect':
        await handler.connectBLE(command.deviceId, command.args?.target_mac || '');
        break;
      case 'wifi_ap':
        await handler.configWiFiAP(
          command.deviceId,
          command.args?.ssid || '',
          command.args?.password,
          command.args?.channel
        );
        break;
      case 'wifi_sta':
        await handler.connectWiFi(
          command.deviceId,
          command.args?.ssid || '',
          command.args?.password || ''
        );
        break;
      case 'ble_proxy_start':
        await handler.enableBLEProxy(command.deviceId, command.args?.target_mac || '');
        break;
      case 'status':
        await handler.getStatus(command.deviceId);
        break;
    }
  }
}

export async function createDeviceHandlers(client: MqttClient): Promise<DeviceHandlerRouter> {
  const router = new DeviceHandlerRouter(client);
  console.log('[Handlers] Device handler router initialized');
  return router;
}
