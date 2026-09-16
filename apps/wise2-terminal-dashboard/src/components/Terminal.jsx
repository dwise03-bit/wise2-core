import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Terminal.css';

export default function Terminal({ wsReady }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const wsRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!wsReady) return;

    // Initialize Xterm
    const xterm = new XTerm({
      theme: {
        background: '#050607',
        foreground: '#e0e0e0',
        cursor: '#00D9FF',
        cursorAccent: '#050607',
        selection: 'rgba(0, 217, 255, 0.3)',
        black: '#1e1e1e',
        red: '#ff6b6b',
        green: '#00FF7F',
        yellow: '#ffd700',
        blue: '#00D9FF',
        magenta: '#ff00ff',
        cyan: '#00D9FF',
        white: '#e0e0e0',
        brightBlack: '#4a4a4a',
        brightRed: '#ff9999',
        brightGreen: '#66ffaa',
        brightYellow: '#ffff99',
        brightBlue: '#66d9ff',
        brightMagenta: '#ff66ff',
        brightCyan: '#66d9ff',
        brightWhite: '#ffffff',
      },
      fontFamily: 'Monaco, Menlo, "Courier New", monospace',
      fontSize: 12,
      lineHeight: 1.5,
      letterSpacing: 0,
      cursorBlink: true,
      scrollback: 1000,
    });

    xtermRef.current = xterm;

    // Setup fit addon
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    xterm.loadAddon(fitAddon);

    // Mount terminal
    xterm.open(terminalRef.current);
    fitAddon.fit();

    // Setup WebSocket
    const ws = new WebSocket(`ws://${window.location.host}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'init' }));
      xterm.write('\r\n🚀 WISE² Terminal Dashboard\r\n');
      xterm.write('Type commands below. Press Ctrl+L to clear.\r\n\r\n');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'output') {
          xterm.write(msg.data);
        } else if (msg.type === 'shell-ready') {
          xterm.write('$ ');
        } else if (msg.type === 'exit') {
          xterm.write('\r\n[Session ended]\r\n');
        }
      } catch (err) {
        console.error('Parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      xterm.write('\r\n❌ Connection error\r\n');
    };

    // Handle terminal input
    xterm.onData((data) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({
          type: 'input',
          data: data,
        }));
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
      if (ws.readyState === 1 && xtermRef.current) {
        ws.send(JSON.stringify({
          type: 'resize',
          cols: xterm.cols,
          rows: xterm.rows,
        }));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ws.readyState === 1) {
        ws.close();
      }
      xterm.dispose();
    };
  }, [wsReady]);

  return (
    <div className="terminal-wrapper">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>
      </div>
      <div className="terminal-container" ref={terminalRef} />
    </div>
  );
}
