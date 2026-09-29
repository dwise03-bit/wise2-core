#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { defaultConfig } from './config.ts';
import { formatValidationReport } from './report.ts';
import { generateDemoCandles } from './sample-data.ts';
import { validateStrategy } from './validation.ts';
import type { Candle } from './types.ts';

function parseCsv(path: string): Candle[] {
  const raw = readFileSync(path, 'utf8').trim();
  const [header, ...rows] = raw.split('\n');
  const columns = header.split(',').map((column) => column.trim());
  return rows.map((row) => {
    const values = row.split(',').map((value) => value.trim());
    const record = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
    return {
      timestamp: String(record.timestamp),
      open: Number(record.open),
      high: Number(record.high),
      low: Number(record.low),
      close: Number(record.close),
      volume: record.volume ? Number(record.volume) : undefined,
      spread: record.spread ? Number(record.spread) : undefined
    };
  });
}

function main(): void {
  const args = process.argv.slice(2);
  const csvIndex = args.indexOf('--csv');
  const candles = csvIndex >= 0 && args[csvIndex + 1]
    ? parseCsv(args[csvIndex + 1])
    : generateDemoCandles();

  const report = validateStrategy(candles, defaultConfig);
  process.stdout.write(`${formatValidationReport(report)}\n`);
}

main();
