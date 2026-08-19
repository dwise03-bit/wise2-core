#!/usr/bin/env node

import { ComfyUIClient } from '../comfyui/ComfyUIClient.js';
import { createLogger, format, transports } from 'winston';
import * as dotenv from 'dotenv';

dotenv.config();

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.printf(({ level, message }) => `[${level}] ${message}`)
  ),
  transports: [new transports.Console()],
});

async function healthCheck() {
  const comfyuiUrl = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
  const comfyui = new ComfyUIClient(comfyuiUrl, logger);

  console.log('\n========== WISE² Visual Factory - Health Check ==========\n');

  try {
    // Check ComfyUI availability
    const health = await comfyui.getHealth();
    console.log('ComfyUI Status:', health.status === 'ok' ? '✓ OK' : '✗ FAILED');

    if (health.status !== 'ok') {
      console.error('ComfyUI is not responding. Check if it is running.');
      process.exit(1);
    }

    // Get system stats
    const stats = await comfyui.getSystemStats();
    console.log('System Stats:', JSON.stringify(stats, null, 2));

    // Get GPU info
    const gpu = await comfyui.getGPUInfo();
    if (gpu) {
      console.log('\n GPU Information:');
      console.log(`  Model: ${gpu.model}`);
      console.log(`  VRAM Total: ${gpu.vramTotal / 1024 / 1024 / 1024} GB`);
      console.log(`  VRAM Free: ${gpu.vramFree / 1024 / 1024 / 1024} GB`);
      console.log(`  VRAM Used: ${gpu.vramUsed / 1024 / 1024 / 1024} GB`);
      console.log(`  Utilization: ${gpu.utilization}%`);
      console.log(`  CUDA Available: ${gpu.cudaAvailable ? '✓' : '✗'}`);
      console.log(`  Driver Version: ${gpu.driverVersion}`);
    } else {
      console.log('GPU: ✗ No GPU detected');
    }

    // List models
    const models = await comfyui.listModels();
    console.log(`\nAvailable Models: ${models.length}`);
    models.slice(0, 5).forEach(model => {
      console.log(`  - ${model.name} (${model.type})`);
    });

    console.log('\n========== Health Check Complete ==========\n');
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  }
}

healthCheck();
