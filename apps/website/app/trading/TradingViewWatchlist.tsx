'use client';

import { useState } from 'react';
import { Star, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  watched?: boolean;
}

interface Props {
  items: WatchlistItem[];
  onAddSymbol?: (symbol: string) => void;
  onRemoveSymbol?: (symbol: string) => void;
  onToggleWatch?: (symbol: string) => void;
}

export default function TradingViewWatchlist({
  items,
  onAddSymbol,
  onRemoveSymbol,
  onToggleWatch,
}: Props) {
  const [newSymbol, setNewSymbol] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (newSymbol.trim()) {
      onAddSymbol?.(newSymbol.toUpperCase());
      setNewSymbol('');
      setShowForm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#0b0d1c] rounded-lg border border-cyan-500/20 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-cyan-100">TradingView Watchlist</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded bg-cyan-600/20 hover:bg-cyan-600/30 transition"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex gap-2"
        >
          <input
            type="text"
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value)}
            placeholder="e.g. AAPL"
            className="flex-1 px-3 py-2 bg-[#0f1729] border border-cyan-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition"
          >
            Add
          </button>
        </motion.div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No watchlist items yet</p>
        ) : (
          items.map(item => (
            <motion.div
              key={item.symbol}
              whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
              className="bg-[#0f1729] rounded p-3 flex items-center justify-between cursor-pointer"
            >
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{item.symbol}</div>
                <div className="text-xs text-slate-400">
                  ${item.price.toFixed(2)}{' '}
                  <span className={item.changePercent > 0 ? 'text-green-400' : 'text-red-400'}>
                    {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleWatch?.(item.symbol)}
                  className="p-1.5 hover:bg-cyan-600/20 rounded transition"
                >
                  <Star
                    className={`w-4 h-4 ${item.watched ? 'fill-cyan-400 text-cyan-400' : 'text-slate-500'}`}
                  />
                </button>
                <button
                  onClick={() => onRemoveSymbol?.(item.symbol)}
                  className="p-1.5 hover:bg-red-600/20 rounded transition"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
