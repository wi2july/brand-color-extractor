import React, { useState, useCallback } from 'react';
import { Plus, AlertCircle, Check } from 'lucide-react';

interface ManualColorInputProps {
  onAdd: (color: { hex: string; rgb: [number, number, number] }) => void;
}

const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

const isValidRgb = (rgb: string): boolean => {
  const match = rgb.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (!match) return false;
  const [, r, g, b] = match;
  return (
    parseInt(r) >= 0 && parseInt(r) <= 255 &&
    parseInt(g) >= 0 && parseInt(g) <= 255 &&
    parseInt(b) >= 0 && parseInt(b) <= 255
  );
};

const parseColor = (input: string): { hex: string; rgb: [number, number, number] } | null => {
  const trimmed = input.trim();

  if (isValidHex(trimmed)) {
    let hex = trimmed.toUpperCase();
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { hex, rgb: [r, g, b] };
  }

  if (isValidRgb(trimmed)) {
    const match = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const hex = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
      return { hex, rgb: [r, g, b] };
    }
  }

  return null;
};

export const ManualColorInput: React.FC<ManualColorInputProps> = ({ onAdd }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewColor, setPreviewColor] = useState<string | null>(null);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError(null);
    setSuccess(false);

    const color = parseColor(value);
    if (color) {
      setPreviewColor(color.hex);
    } else {
      setPreviewColor(null);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      setError('Please enter a color value');
      return;
    }

    const color = parseColor(input);
    if (!color) {
      setError('Invalid format. Use HEX (e.g., #FF5733) or RGB (e.g., rgb(255, 87, 51))');
      return;
    }

    onAdd(color);
    setInput('');
    setPreviewColor(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  }, [input, onAdd]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="#FF5733 or rgb(255, 87, 51)"
              className="w-full px-4 py-3 border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:border-black transition-colors"
            />
            {previewColor && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 border border-border"
                style={{ backgroundColor: previewColor }}
              />
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-6 py-3 bg-black text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {success ? (
              <>
                <Check size={16} />
                Added
              </>
            ) : (
              <>
                <Plus size={16} />
                Add
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 py-3 px-4 border border-black bg-muted">
            <AlertCircle size={16} className="text-text-primary" />
            <p className="text-text-primary text-sm">{error}</p>
          </div>
        )}

        <p className="text-text-muted text-xs">
          Supported formats: HEX (#FF5733, #F53) or RGB (rgb(255, 87, 51))
        </p>
      </form>
    </div>
  );
};
