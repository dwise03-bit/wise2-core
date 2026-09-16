#!/usr/bin/env node

const K10Client = require('./k10-client');

async function testK10() {
  console.log('🧪 Testing K10 API Client...\n');

  const k10 = new K10Client({
    baseURL: process.env.K10_API_URL || 'http://192.168.1.100:5000',
    timeout: 5000,
  });

  console.log('Testing endpoint:', k10.baseURL);
  console.log('');

  try {
    console.log('1️⃣  Getting device info...');
    const info = await k10.getDeviceInfo();
    console.log('   Status:', info.online ? '🟢 ONLINE' : '🔴 OFFLINE');
    console.log('   Firmware:', info.firmware);
    console.log('   Display:', info.display);
    console.log('   Metrics:', info.metrics);
    console.log('');

    if (info.online) {
      console.log('2️⃣  Testing display...');
      const display = await k10.testDisplay('color_bars');
      console.log('   Result:', display.success ? '✅ OK' : '❌ Failed');
      console.log('');

      console.log('3️⃣  Getting WiFi info...');
      const wifi = await k10.getWiFi();
      console.log('   Connected:', wifi.connected ? '✅ Yes' : '❌ No');
      console.log('   SSID:', wifi.ssid);
      console.log('   Signal:', wifi.signal + '%');
      console.log('');

      console.log('4️⃣  Testing microphone...');
      const mic = await k10.testMicrophone(1);
      console.log('   Result:', mic.success ? '✅ Started' : '❌ Failed');
      console.log('');
    } else {
      console.log('⚠️  Device is offline. Skipping feature tests.\n');
    }

    console.log('✅ K10 API Client test complete');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testK10();
