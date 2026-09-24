// ASCII Graphics and Visualizations for Terminal

export const createSparkline = (data, width = 20) => {
  if (!data || data.length === 0) return '▁▁▁▁▁';

  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data
    .slice(-width)
    .map(v => {
      const normalized = (v - min) / range;
      const index = Math.floor(normalized * (chars.length - 1));
      return chars[index];
    })
    .join('');
};

export const createBar = (value, width = 30, maxValue = 100) => {
  const filled = Math.round((value / maxValue) * width);
  const empty = width - filled;

  let color = '\x1b[32m'; // green
  if (value > 80) color = '\x1b[31m'; // red
  else if (value > 60) color = '\x1b[33m'; // yellow
  else if (value > 40) color = '\x1b[36m'; // cyan

  return `${color}${'█'.repeat(filled)}\x1b[0m${'░'.repeat(empty)}`;
};

export const createSystemStats = (cpu, memory, disk) => {
  return [
    '\x1b[1;36m╔══════════════════════════════════════════╗\x1b[0m',
    '\x1b[36m║\x1b[0m        \x1b[1mSYSTEM PERFORMANCE METRICS\x1b[0m         \x1b[36m║\x1b[0m',
    '\x1b[36m╠══════════════════════════════════════════╣\x1b[0m',
    `\x1b[36m║\x1b[0m CPU:    ${createBar(cpu, 25)} \x1b[1;33m${cpu}%\x1b[0m \x1b[36m║\x1b[0m`,
    `\x1b[36m║\x1b[0m Memory: ${createBar(memory, 25)} \x1b[1;35m${memory}%\x1b[0m \x1b[36m║\x1b[0m`,
    `\x1b[36m║\x1b[0m Disk:   ${createBar(disk, 25)} \x1b[1;31m${disk}%\x1b[0m \x1b[36m║\x1b[0m`,
    '\x1b[36m╚══════════════════════════════════════════╝\x1b[0m',
  ].join('\r\n');
};

export const createServicesDisplay = (services) => {
  const lines = [
    '\x1b[1;36m╔══════════════════════════════════════╗\x1b[0m',
    '\x1b[36m║\x1b[0m      \x1b[1mSERVICE HEALTH STATUS\x1b[0m      \x1b[36m║\x1b[0m',
    '\x1b[36m╠══════════════════════════════════════╣\x1b[0m',
  ];

  Object.entries(services).forEach(([name, status]) => {
    const icon = status === 'online' ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
    const statusStr = status === 'online' ? '\x1b[32mONLINE\x1b[0m' : '\x1b[31mOFFLINE\x1b[0m';
    const padding = ' '.repeat(Math.max(0, 22 - name.length));
    lines.push(`\x1b[36m║\x1b[0m ${icon} ${name}${padding}${statusStr} \x1b[36m║\x1b[0m`);
  });

  lines.push('\x1b[36m╚══════════════════════════════════════╝\x1b[0m');
  return lines.join('\r\n');
};

export const createMetricsHistory = (label, data, width = 40) => {
  const sparkline = createSparkline(data, width);
  const avg = data.length > 0 ? (data.reduce((a, b) => a + b) / data.length).toFixed(1) : 0;
  const max = data.length > 0 ? Math.max(...data) : 0;

  return `\x1b[1;33m${label}\x1b[0m: ${sparkline} \x1b[36mAvg: ${avg}%\x1b[0m Max: \x1b[31m${max}%\x1b[0m`;
};

export const createWelcomeBanner = () => {
  return [
    '\x1b[1;35m',
    '    ╭─────────────────────────────────────╮',
    '    │  WISE² TERMINAL DASHBOARD v1.0      │',
    '    │  Professional System Monitoring      │',
    '    ╰─────────────────────────────────────╯',
    '\x1b[0m',
    '\x1b[36m➜\x1b[0m  Real-time Monitoring Active',
    '\x1b[36m➜\x1b[0m  WebSocket Streaming Enabled',
    '\x1b[36m➜\x1b[0m  Terminal PTY Ready\r\n',
  ].join('\r\n');
};

export const createStatusIndicator = (status) => {
  if (status === 'online') return '\x1b[32m●\x1b[0m';
  if (status === 'warning') return '\x1b[33m●\x1b[0m';
  if (status === 'offline') return '\x1b[31m●\x1b[0m';
  return '\x1b[36m●\x1b[0m';
};
