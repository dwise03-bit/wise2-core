'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '../../../../src/components/ui';

interface SheetSize {
  label: string;
  width: number;
  height: number;
  price: number;
}

interface DesignItem {
  id: string;
  name: string;
  widthIn: number;
  heightIn: number;
  quantity: number;
  x: number;
  y: number;
  placed: boolean;
  color: string;
}

const SHEET_SIZES: SheetSize[] = [
  { label: 'Small (12×16")', width: 12, height: 16, price: 18 },
  { label: 'Medium (22×16")', width: 22, height: 16, price: 28 },
  { label: 'Large (22×32")', width: 22, height: 32, price: 48 },
  { label: 'XL (22×48")', width: 22, height: 48, price: 65 },
];

const MARGIN = 0.25;
const COLORS = ['#72FF3B', '#27C7FF', '#FF6B35', '#B020FF', '#FFB800', '#FF3B72', '#3BFFD4', '#FF3B3B'];

let nextId = 1;

function autoPlace(items: DesignItem[], sheetW: number, sheetH: number): DesignItem[] {
  const placed: DesignItem[] = [];
  let cursorX = MARGIN;
  let cursorY = MARGIN;
  let rowHeight = 0;

  for (const item of items) {
    for (let q = 0; q < item.quantity; q++) {
      const w = item.widthIn;
      const h = item.heightIn;

      if (cursorX + w + MARGIN > sheetW) {
        cursorX = MARGIN;
        cursorY += rowHeight + MARGIN;
        rowHeight = 0;
      }

      const fits = cursorY + h + MARGIN <= sheetH;
      placed.push({
        ...item,
        id: `${item.id}-${q}`,
        quantity: 1,
        x: fits ? cursorX : 0,
        y: fits ? cursorY : 0,
        placed: fits,
      });

      if (fits) {
        rowHeight = Math.max(rowHeight, h);
        cursorX += w + MARGIN;
      }
    }
  }

  return placed;
}

export default function GangSheetBuilderPage() {
  const [selectedSize, setSelectedSize] = useState<SheetSize>(SHEET_SIZES[2]);
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newWidth, setNewWidth] = useState('3');
  const [newHeight, setNewHeight] = useState('3');
  const [newQty, setNewQty] = useState('1');
  const [placedItems, setPlacedItems] = useState<DesignItem[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const SCALE = 20;

  const addDesign = useCallback(() => {
    const w = parseFloat(newWidth);
    const h = parseFloat(newHeight);
    const q = parseInt(newQty, 10);
    if (!newName || isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || isNaN(q) || q < 1) return;

    const design: DesignItem = {
      id: `d${nextId++}`,
      name: newName,
      widthIn: w,
      heightIn: h,
      quantity: q,
      x: 0,
      y: 0,
      placed: false,
      color: COLORS[(designs.length) % COLORS.length],
    };

    const updated = [...designs, design];
    setDesigns(updated);
    setPlacedItems(autoPlace(updated, selectedSize.width, selectedSize.height));
    setNewName('');
    setNewWidth('3');
    setNewHeight('3');
    setNewQty('1');
  }, [newName, newWidth, newHeight, newQty, designs, selectedSize]);

  const removeDesign = useCallback((id: string) => {
    const baseId = id.split('-')[0];
    const updated = designs.filter(d => d.id !== baseId);
    setDesigns(updated);
    setPlacedItems(autoPlace(updated, selectedSize.width, selectedSize.height));
  }, [designs, selectedSize]);

  const changeSheet = useCallback((size: SheetSize) => {
    setSelectedSize(size);
    setPlacedItems(autoPlace(designs, size.width, size.height));
  }, [designs]);

  const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const item = placedItems[index];
    setDragIndex(index);
    setDragOffset({
      x: (e.clientX - rect.left) / SCALE - item.x,
      y: (e.clientY - rect.top) / SCALE - item.y,
    });
  }, [placedItems]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragIndex === null || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left) / SCALE - dragOffset.x;
    const newY = (e.clientY - rect.top) / SCALE - dragOffset.y;
    const item = placedItems[dragIndex];

    const clampedX = Math.max(MARGIN, Math.min(newX, selectedSize.width - item.widthIn - MARGIN));
    const clampedY = Math.max(MARGIN, Math.min(newY, selectedSize.height - item.heightIn - MARGIN));

    setPlacedItems(prev => prev.map((p, i) =>
      i === dragIndex ? { ...p, x: clampedX, y: clampedY, placed: true } : p
    ));
  }, [dragIndex, dragOffset, placedItems, selectedSize]);

  const handleMouseUp = useCallback(() => {
    setDragIndex(null);
  }, []);

  const totalPlaced = placedItems.filter(p => p.placed).length;
  const totalItems = placedItems.length;
  const usedArea = placedItems.filter(p => p.placed).reduce((a, p) => a + p.widthIn * p.heightIn, 0);
  const sheetArea = selectedSize.width * selectedSize.height;
  const utilization = sheetArea > 0 ? Math.round((usedArea / sheetArea) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/print-on-demand" className="text-[var(--text-secondary)] hover:text-white text-sm">
              &larr; Print Shop
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Gang Sheet Builder</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Pack multiple designs onto a single DTF transfer sheet for maximum value.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Controls */}
        <div className="space-y-4">
          {/* Sheet Size */}
          <Card>
            <h3 className="text-sm font-semibold mb-3">Sheet Size</h3>
            <div className="grid grid-cols-2 gap-2">
              {SHEET_SIZES.map(size => (
                <button
                  key={size.label}
                  onClick={() => changeSheet(size)}
                  className={`p-3 rounded-lg text-xs font-medium border transition-all ${
                    selectedSize.label === size.label
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                      : 'border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <div>{size.label}</div>
                  <div className="mt-1 font-bold">${size.price}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Add Design */}
          <Card>
            <h3 className="text-sm font-semibold mb-3">Add Design</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Design name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">W (in)</label>
                  <input
                    type="number"
                    value={newWidth}
                    onChange={e => setNewWidth(e.target.value)}
                    step="0.5"
                    min="0.5"
                    className="w-full px-2 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-white focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">H (in)</label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={e => setNewHeight(e.target.value)}
                    step="0.5"
                    min="0.5"
                    className="w-full px-2 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-white focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Qty</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={e => setNewQty(e.target.value)}
                    min="1"
                    className="w-full px-2 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-white focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>
              <Button onClick={addDesign} className="w-full">
                Add to Sheet
              </Button>
            </div>
          </Card>

          {/* Design List */}
          {designs.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold mb-3">Designs ({designs.length})</h3>
              <div className="space-y-2">
                {designs.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-tertiary)]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                      <div>
                        <div className="text-xs font-medium">{d.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          {d.widthIn}" × {d.heightIn}" × {d.quantity}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDesign(d.id)}
                      className="text-[var(--text-secondary)] hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <h3 className="text-sm font-semibold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Sheet</span>
                <span>{selectedSize.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Designs Placed</span>
                <span>{totalPlaced} / {totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Utilization</span>
                <Badge variant={utilization > 60 ? 'success' : utilization > 30 ? 'warning' : 'neutral'}>
                  {utilization}%
                </Badge>
              </div>
              <div className="border-t border-[var(--border-primary)] pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[var(--accent-primary)]">${selectedSize.price.toFixed(2)}</span>
              </div>
            </div>
            {totalPlaced > 0 && (
              <Button className="w-full mt-3">
                Create Order
              </Button>
            )}
          </Card>
        </div>

        {/* Right Panel: Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Layout Preview — {selectedSize.width}" × {selectedSize.height}"
              </h3>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span>Drag to reposition</span>
                <span>•</span>
                <span>{utilization}% used</span>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-[var(--border-primary)] bg-[#0A0A0A] p-4">
              <div
                ref={canvasRef}
                className="relative mx-auto"
                style={{
                  width: selectedSize.width * SCALE,
                  height: selectedSize.height * SCALE,
                  background: 'repeating-conic-gradient(#1a1a1a 0% 25%, #141414 0% 50%) 0 0 / 20px 20px',
                  border: '2px dashed rgba(114, 255, 59, 0.3)',
                  borderRadius: 4,
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Margin guides */}
                <div
                  className="absolute border border-dashed pointer-events-none"
                  style={{
                    left: MARGIN * SCALE,
                    top: MARGIN * SCALE,
                    width: (selectedSize.width - MARGIN * 2) * SCALE,
                    height: (selectedSize.height - MARGIN * 2) * SCALE,
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                />

                {/* Placed designs */}
                {placedItems.map((item, i) => (
                  item.placed && (
                    <div
                      key={item.id}
                      className="absolute flex flex-col items-center justify-center cursor-move select-none"
                      style={{
                        left: item.x * SCALE,
                        top: item.y * SCALE,
                        width: item.widthIn * SCALE,
                        height: item.heightIn * SCALE,
                        backgroundColor: `${item.color}20`,
                        border: `2px solid ${item.color}`,
                        borderRadius: 3,
                        zIndex: dragIndex === i ? 10 : 1,
                        boxShadow: dragIndex === i ? `0 0 12px ${item.color}40` : 'none',
                      }}
                      onMouseDown={e => handleMouseDown(e, i)}
                    >
                      <span className="text-[9px] font-bold truncate px-1" style={{ color: item.color }}>
                        {item.name}
                      </span>
                      <span className="text-[8px] opacity-60" style={{ color: item.color }}>
                        {item.widthIn}"×{item.heightIn}"
                      </span>
                    </div>
                  )
                ))}

                {/* Empty state */}
                {placedItems.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)] text-sm">
                    Add designs to start building your gang sheet
                  </div>
                )}
              </div>
            </div>

            {/* Overflow warning */}
            {placedItems.some(p => !p.placed) && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {placedItems.filter(p => !p.placed).length} design(s) do not fit on this sheet.
                Try a larger sheet size or reduce design dimensions.
              </div>
            )}

            {/* Sheet ruler */}
            <div className="mt-3 flex justify-between text-[10px] text-[var(--text-secondary)]">
              <span>0"</span>
              <span>{Math.round(selectedSize.width / 4)}"</span>
              <span>{Math.round(selectedSize.width / 2)}"</span>
              <span>{Math.round(selectedSize.width * 3 / 4)}"</span>
              <span>{selectedSize.width}"</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
