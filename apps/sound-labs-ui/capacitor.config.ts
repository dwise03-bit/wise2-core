import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wise2.soundlabs',
  appName: 'WISE² Sound Labs',
  webDir: 'dist',
  // The bridge (services/sound-labs/bridge) is plain HTTP/WS on a local or
  // Tailscale address. Capacitor's WebView serves the app from a virtual
  // https://localhost origin, so without this the OS blocks every bridge
  // fetch/WebSocket as mixed content — android:usesCleartextTraffic in the
  // manifest is a separate, insufficient setting for this.
  android: {
    allowMixedContent: true,
  },
};

export default config;
