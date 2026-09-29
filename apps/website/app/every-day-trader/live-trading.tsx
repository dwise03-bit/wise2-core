'use client';

import { useState, useEffect } from 'react';
import styles from './trader-3d.module.css';

interface LiveTrade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
  status: 'pending' | 'filled' | 'cancelled';
}

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export default function LiveTrading() {
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [positions, setPositions] = useState<Position[]>([
    { symbol: 'NVDA', quantity: 100, avgPrice: 220.0, currentPrice: 225.07, pnl: 507, pnlPercent: 2.3 },
    { symbol: 'AAPL', quantity: 50, avgPrice: 225.0, currentPrice: 227.52, pnl: 126, pnlPercent: 1.12 },
  ]);
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState(225.00);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map(pos => ({
        ...pos,
        currentPrice: pos.currentPrice + (Math.random() - 0.5) * 2,
        pnl: (pos.currentPrice + (Math.random() - 0.5) * 2 - pos.avgPrice) * pos.quantity,
      })).map(pos => ({
        ...pos,
        pnlPercent: ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handlePlaceOrder = () => {
    const newTrade: LiveTrade = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      type: orderType,
      quantity,
      price: limitPrice,
      timestamp: new Date(),
      status: 'pending',
    };

    setTrades(prev => [newTrade, ...prev]);

    setTimeout(() => {
      setTrades(prev =>
        prev.map(t => (t.id === newTrade.id ? { ...t, status: 'filled' } : t))
      );
    }, 1500);
  };

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPnLPercent = (totalPnL / positions.reduce((sum, pos) => sum + pos.avgPrice * pos.quantity, 0)) * 100;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
      {/* Live Positions */}
      <article className={styles.premiumPanel}>
        <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
          📊 LIVE POSITIONS
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {positions.map(pos => (
            <div
              key={pos.symbol}
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(12, 126, 216, 0.2)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                alignItems: 'center',
                fontSize: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#f4f8ff' }}>{pos.symbol}</div>
                <div style={{ color: '#7a9fb5', fontSize: '11px' }}>{pos.quantity} @ {pos.avgPrice.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#d4e3f7' }}>${pos.currentPrice.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: pos.pnl >= 0 ? '#00ff7f' : '#ff3b7f', fontWeight: 700 }}>
                  +${pos.pnl.toFixed(0)}
                </div>
                <div style={{ color: pos.pnlPercent >= 0 ? '#00ff7f' : '#ff3b7f', fontSize: '11px' }}>
                  {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}

          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.1), rgba(0, 217, 255, 0.1))',
              border: '1px solid rgba(0, 255, 127, 0.3)',
              marginTop: '8px',
              fontSize: '12px',
            }}
          >
            <div style={{ color: '#7a9fb5', marginBottom: '4px' }}>Total P&L</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: totalPnL >= 0 ? '#00ff7f' : '#ff3b7f' }}>
              +${totalPnL.toFixed(0)} ({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </article>

      {/* Order Placement */}
      <article className={styles.premiumPanel}>
        <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
          ⚡ PLACE ORDER
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#7a9fb5', display: 'block', marginBottom: '4px' }}>
              Symbol
            </label>
            <select
              value={selectedSymbol}
              onChange={e => setSelectedSymbol(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(6, 26, 51, 0.8)',
                border: '1px solid rgba(12, 126, 216, 0.3)',
                color: '#f4f8ff',
                fontSize: '12px',
              }}
            >
              <option>NVDA</option>
              <option>AAPL</option>
              <option>TSLA</option>
              <option>MSFT</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#7a9fb5', display: 'block', marginBottom: '4px' }}>
                Type
              </label>
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value as 'buy' | 'sell')}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(6, 26, 51, 0.8)',
                  border: '1px solid rgba(12, 126, 216, 0.3)',
                  color: orderType === 'buy' ? '#00ff7f' : '#ff3b7f',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <option value="buy">BUY</option>
                <option value="sell">SELL</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#7a9fb5', display: 'block', marginBottom: '4px' }}>
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(6, 26, 51, 0.8)',
                  border: '1px solid rgba(12, 126, 216, 0.3)',
                  color: '#f4f8ff',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#7a9fb5', display: 'block', marginBottom: '4px' }}>
              Limit Price
            </label>
            <input
              type="number"
              value={limitPrice}
              onChange={e => setLimitPrice(parseFloat(e.target.value))}
              step="0.01"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                background: 'rgba(6, 26, 51, 0.8)',
                border: '1px solid rgba(12, 126, 216, 0.3)',
                color: '#f4f8ff',
                fontSize: '12px',
              }}
            />
          </div>

          <button
            onClick={handlePlaceOrder}
            className={styles.buttonPremium}
            style={{ marginTop: 'auto', fontWeight: 700 }}
          >
            {orderType === 'buy' ? '🚀 BUY' : '🔻 SELL'}
          </button>
        </div>
      </article>

      {/* Recent Orders */}
      {trades.length > 0 && (
        <article className={styles.premiumPanel} style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            📝 ORDER HISTORY
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {trades.slice(0, 5).map(trade => (
              <div
                key={trade.id}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'rgba(12, 126, 216, 0.15)',
                  border: `1px solid ${trade.status === 'filled' ? 'rgba(0, 255, 127, 0.3)' : 'rgba(255, 215, 0, 0.3)'}`,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  gap: '12px',
                  alignItems: 'center',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: 700, color: trade.type === 'buy' ? '#00ff7f' : '#ff3b7f' }}>
                  {trade.type.toUpperCase()}
                </div>
                <div style={{ color: '#d4e3f7' }}>
                  {trade.quantity} {trade.symbol}
                </div>
                <div style={{ color: '#7a9fb5' }}>${trade.price.toFixed(2)}</div>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    background: trade.status === 'filled' ? 'rgba(0, 255, 127, 0.2)' : 'rgba(255, 215, 0, 0.2)',
                    color: trade.status === 'filled' ? '#00ff7f' : '#FFD700',
                  }}
                >
                  {trade.status === 'filled' ? '✓ FILLED' : '⏳ PENDING'}
                </div>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}
