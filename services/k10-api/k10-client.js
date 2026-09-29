'use strict';

let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  // node-fetch not available, will be provided via options
}

class K10Client {
  constructor(options = {}) {
    this.baseURL = options.baseURL || process.env.K10_API_URL || 'http://192.168.1.100:5000';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 2;
    this.fetch = options.fetch || fetch || global.fetch;

    if (!this.fetch) {
      throw new Error('fetch not available: pass options.fetch or install node-fetch');
    }
  }

  async request(path, method = 'GET', body = null) {
    let lastError;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const url = `${this.baseURL}${path}`;
        const options = {
          method,
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        const res = await this.fetch(url, options);

        if (!res.ok) {
          throw new Error(`K10 API error: ${res.status} ${res.statusText}`);
        }

        return await res.json();
      } catch (error) {
        lastError = error;

        if (attempt < this.retries) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
      }
    }

    throw lastError || new Error('K10 request failed');
  }

  async getStatus() {
    try {
      return await this.request('/api/status');
    } catch (error) {
      return {
        status: 'offline',
        error: error.message,
      };
    }
  }

  async getDisplay() {
    try {
      return await this.request('/api/display');
    } catch (error) {
      return {
        display: 'unknown',
        error: error.message,
      };
    }
  }

  async testDisplay(pattern = 'color_bars') {
    try {
      return await this.request('/api/display/test', 'POST', { pattern });
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getWiFi() {
    try {
      return await this.request('/api/wifi');
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  async testMicrophone(duration = 3) {
    try {
      return await this.request('/api/microphone/test', 'POST', { duration });
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getMetrics() {
    try {
      return await this.request('/api/metrics');
    } catch (error) {
      return {
        cpu: 0,
        memory: 0,
        temperature: 0,
        error: error.message,
      };
    }
  }

  async sync(data = {}) {
    try {
      return await this.request('/api/sync', 'POST', data);
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getFirmwareVersion() {
    try {
      const data = await this.request('/api/firmware');
      return data.version || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  async getDeviceInfo() {
    try {
      const [status, display, wifi, metrics, firmware] = await Promise.all([
        this.getStatus(),
        this.getDisplay(),
        this.getWiFi(),
        this.getMetrics(),
        this.getFirmwareVersion(),
      ]);

      return {
        status: status.status || 'unknown',
        display: display.display || 'unknown',
        wifi: wifi,
        metrics,
        firmware,
        online: status.status === 'online',
      };
    } catch (error) {
      return {
        online: false,
        error: error.message,
      };
    }
  }
}

module.exports = K10Client;
