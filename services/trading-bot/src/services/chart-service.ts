import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { TradeSetup, OHLCV } from '../../../packages/trading-engine/src/aether-trader';

/**
 * ChartService: Generate trading charts with technical analysis overlays
 */
export class ChartService {
  private width = 1200;
  private height = 600;
  private chartRenderer: ChartJSNodeCanvas;

  constructor() {
    this.chartRenderer = new ChartJSNodeCanvas({
      width: this.width,
      height: this.height,
      chartCallback: (ChartJS) => {
        // Register plugins or customize Chart.js here
      },
    });
  }

  /**
   * Generate a chart showing the setup with candles, levels, and entry/target zones
   */
  async generateSetupChart(symbol: string, setup: TradeSetup, candles: OHLCV[]): Promise<Buffer | null> {
    try {
      if (candles.length === 0) return null;

      const labels = candles.map((c) => c.time.toLocaleTimeString());
      const closes = candles.map((c) => c.close);

      const chartConfig = {
        type: 'line' as const,
        data: {
          labels,
          datasets: [
            // Price line
            {
              label: 'Price',
              data: closes,
              borderColor: '#00D9FF',
              backgroundColor: 'rgba(0, 217, 255, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
            // Stop loss line
            {
              label: 'Stop Loss',
              data: Array(candles.length).fill(setup.stopPrice),
              borderColor: '#ff0000',
              borderWidth: 2,
              borderDash: [5, 5],
              fill: false,
              pointRadius: 0,
            },
            // Target line
            {
              label: 'Target',
              data: Array(candles.length).fill(setup.targetPrice),
              borderColor: '#00ff00',
              borderWidth: 2,
              borderDash: [5, 5],
              fill: false,
              pointRadius: 0,
            },
            // Entry zone top
            {
              label: 'Entry Zone (High)',
              data: Array(candles.length).fill(setup.entryZone.end),
              borderColor: 'rgba(255, 215, 0, 0.5)',
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderWidth: 1,
              fill: false,
              pointRadius: 0,
            },
            // Entry zone bottom
            {
              label: 'Entry Zone (Low)',
              data: Array(candles.length).fill(setup.entryZone.start),
              borderColor: 'rgba(255, 215, 0, 0.5)',
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderWidth: 1,
              fill: false,
              pointRadius: 0,
            },
            // Impulse high (if available)
            ...(setup.impulseHigh
              ? [
                  {
                    label: 'Impulse High',
                    data: Array(candles.length).fill(setup.impulseHigh),
                    borderColor: 'rgba(100, 200, 255, 0.5)',
                    borderWidth: 1,
                    borderDash: [2, 2],
                    fill: false,
                    pointRadius: 0,
                  },
                ]
              : []),
            // Impulse low (if available)
            ...(setup.impulseLow
              ? [
                  {
                    label: 'Impulse Low',
                    data: Array(candles.length).fill(setup.impulseLow),
                    borderColor: 'rgba(100, 200, 255, 0.5)',
                    borderWidth: 1,
                    borderDash: [2, 2],
                    fill: false,
                    pointRadius: 0,
                  },
                ]
              : []),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'top' as const,
            },
            title: {
              display: true,
              text: `${symbol} - ${setup.direction} Setup (${setup.type})`,
              font: { size: 16 },
            },
          },
          scales: {
            y: {
              ticks: { color: '#888' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            x: {
              ticks: { color: '#888' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
          },
        },
      };

      return await this.chartRenderer.renderToBuffer(chartConfig);
    } catch (error) {
      console.error('Error generating setup chart:', error);
      return null;
    }
  }

  /**
   * Generate a simple price chart
   */
  async generatePriceChart(symbol: string, candles: OHLCV[]): Promise<Buffer | null> {
    try {
      if (candles.length === 0) return null;

      const labels = candles.map((c) => c.time.toLocaleTimeString());
      const closes = candles.map((c) => c.close);
      const highs = candles.map((c) => c.high);
      const lows = candles.map((c) => c.low);

      const chartConfig = {
        type: 'line' as const,
        data: {
          labels,
          datasets: [
            {
              label: 'Close',
              data: closes,
              borderColor: '#00D9FF',
              backgroundColor: 'rgba(0, 217, 255, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.3,
            },
            {
              label: 'High',
              data: highs,
              borderColor: '#00ff00',
              borderWidth: 1,
              fill: false,
              tension: 0.3,
            },
            {
              label: 'Low',
              data: lows,
              borderColor: '#ff0000',
              borderWidth: 1,
              fill: false,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'top' as const,
            },
            title: {
              display: true,
              text: `${symbol} - Price Action`,
              font: { size: 16 },
            },
          },
          scales: {
            y: {
              ticks: { color: '#888' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            x: {
              ticks: { color: '#888' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
          },
        },
      };

      return await this.chartRenderer.renderToBuffer(chartConfig);
    } catch (error) {
      console.error('Error generating price chart:', error);
      return null;
    }
  }

  /**
   * Generate volume profile chart
   */
  async generateVolumeChart(symbol: string, candles: OHLCV[]): Promise<Buffer | null> {
    try {
      if (candles.length === 0) return null;

      const labels = candles.map((c) => c.time.toLocaleTimeString());
      const volumes = candles.map((c) => c.volume || 0);

      const chartConfig = {
        type: 'bar' as const,
        data: {
          labels,
          datasets: [
            {
              label: 'Volume',
              data: volumes,
              backgroundColor: volumes.map((v) =>
                volumes.length > 0 && v > Math.max(...volumes) * 0.8 ? '#ff00ff' : '#00D9FF'
              ),
              borderColor: '#00D9FF',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: true },
            title: {
              display: true,
              text: `${symbol} - Volume Profile`,
              font: { size: 16 },
            },
          },
          scales: {
            y: {
              ticks: { color: '#888' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            x: {
              ticks: { color: '#888' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
          },
        },
      };

      return await this.chartRenderer.renderToBuffer(chartConfig);
    } catch (error) {
      console.error('Error generating volume chart:', error);
      return null;
    }
  }
}
