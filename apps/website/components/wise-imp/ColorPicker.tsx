'use client';

import { GLOW_HEX } from './WiseImpMascot';
import type { GlowColor } from './useWiseImpStore';

interface ColorPickerProps {
  value: GlowColor;
  onChange: (color: GlowColor) => void;
}

const PRESETS: Array<{ id: GlowColor; label: string }> = [
  { id: 'blue', label: 'Electric Blue' },
  { id: 'green', label: 'Neon Green' },
  { id: 'magenta', label: 'Magenta' },
  { id: 'gold', label: 'Gold' },
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Wise Imp glow color"
      style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 4px' }}
    >
      {PRESETS.map((preset) => {
        const selected = value === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={preset.label}
            title={preset.label}
            onClick={() => onChange(preset.id)}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: GLOW_HEX[preset.id],
              border: selected ? '2px solid white' : '2px solid rgba(255,255,255,0.25)',
              boxShadow: selected ? `0 0 8px ${GLOW_HEX[preset.id]}` : 'none',
              cursor: 'pointer',
              padding: 0,
              outlineOffset: 2,
            }}
          />
        );
      })}
    </div>
  );
}
