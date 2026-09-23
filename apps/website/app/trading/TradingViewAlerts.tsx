'use client';

import { useState } from 'react';
import { Bell, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Alert {
  id: string;
  symbol: string;
  type: 'ABOVE' | 'BELOW';
  price: number;
  active: boolean;
  triggered?: boolean;
}

interface Props {
  alerts: Alert[];
  username?: string;
  onCreateAlert?: (symbol: string, type: 'ABOVE' | 'BELOW', price: number) => void;
  onDeleteAlert?: (id: string) => void;
  onToggleAlert?: (id: string) => void;
}

export default function TradingViewAlerts({
  alerts,
  username = 'dwise03',
  onCreateAlert,
  onDeleteAlert,
  onToggleAlert,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ symbol: '', type: 'ABOVE' as 'ABOVE' | 'BELOW', price: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (formData.symbol && formData.price) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/trading/tradingview/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            symbol: formData.symbol.toUpperCase(),
            type: formData.type,
            price: parseFloat(formData.price),
          }),
        });

        if (response.ok) {
          onCreateAlert?.(formData.symbol.toUpperCase(), formData.type, parseFloat(formData.price));
          setFormData({ symbol: '', type: 'ABOVE', price: '' });
          setShowForm(false);
        }
      } catch (err) {
        console.error('Failed to create alert:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/trading/tradingview/alerts/${username}/${id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        onDeleteAlert?.(id);
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/trading/tradingview/alerts/${username}/${id}/toggle`,
        { method: 'POST' }
      );

      if (response.ok) {
        onToggleAlert?.(id);
      }
    } catch (err) {
      console.error('Failed to toggle alert:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#0b0d1c] rounded-lg border border-amber-500/20 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-amber-100">Price Alerts</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded bg-amber-600/20 hover:bg-amber-600/30 transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 space-y-2 p-3 bg-[#0f1729] rounded border border-amber-500/20"
        >
          <input
            type="text"
            value={formData.symbol}
            onChange={e => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="Symbol (e.g. AAPL)"
            className="w-full px-3 py-2 bg-[#070812] border border-amber-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as 'ABOVE' | 'BELOW' })}
              className="flex-1 px-3 py-2 bg-[#070812] border border-amber-500/30 rounded text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ABOVE">Alert when price goes above</option>
              <option value="BELOW">Alert when price goes below</option>
            </select>
          </div>
          <input
            type="number"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
            placeholder="Price level"
            className="w-full px-3 py-2 bg-[#070812] border border-amber-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            step="0.01"
          />
          <button
            onClick={handleCreate}
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition"
          >
            Create Alert
          </button>
        </motion.div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No alerts configured</p>
        ) : (
          alerts.map(alert => (
            <motion.div
              key={alert.id}
              whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
              className={`rounded p-3 flex items-center justify-between ${
                alert.triggered ? 'bg-amber-900/30 border border-amber-600' : 'bg-[#0f1729]'
              }`}
            >
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{alert.symbol}</div>
                <div className="text-xs text-slate-400">
                  Alert when price goes {alert.type === 'ABOVE' ? '📈' : '📉'} ${alert.price.toFixed(2)}
                </div>
                {alert.triggered && (
                  <div className="text-xs text-amber-400 font-semibold mt-1">🔔 Triggered!</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(alert.id)}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-xs transition ${
                    alert.active
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      : 'bg-slate-600/20 text-slate-400 hover:bg-slate-600/30'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {alert.active ? 'Active' : 'Paused'}
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  disabled={loading}
                  className={`p-1.5 hover:bg-red-600/20 rounded transition ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
