import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface ColorCardProps {
  color: string;
  label?: string;
  usage?: string;
  size?: 'sm' | 'md' | 'lg';
}

const formatColor = (color: string): { hex: string; rgb: string } => {
  let hex = color.toUpperCase();
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  const rgb = `rgb(${r}, ${g}, ${b})`;
  return { hex, rgb };
};

export const ColorCard: React.FC<ColorCardProps> = ({
  color,
  label,
  usage,
  size = 'md',
}) => {
  const [copied, setCopied] = useState(false);
  const [showValues, setShowValues] = useState(false);
  const { hex } = formatColor(color);

  const sizeClasses = {
    sm: 'h-20',
    md: 'h-28',
    lg: 'h-36',
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isLight = (hexColor: string): boolean => {
    let hex = hexColor;
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const textColor = isLight(color) ? '#000000' : '#FFFFFF';
  const displayColor = hex.startsWith('#') ? hex : `#${hex}`;

  return (
    <div className="group">
      <div
        className={`
          relative ${sizeClasses[size]} border border-border cursor-pointer
          transition-all duration-200
        `}
        style={{ backgroundColor: displayColor }}
        onMouseEnter={() => setShowValues(true)}
        onMouseLeave={() => setShowValues(false)}
      >
        {showValues && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: `${displayColor}CC` }}
          >
            <button
              onClick={() => handleCopy(hex)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: textColor }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : hex}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3">
        {label && (
          <p className="text-text-primary text-sm font-medium">{label}</p>
        )}
        <p className="text-text-secondary text-xs font-mono mt-1">{hex}</p>
        {usage && (
          <p className="text-text-muted text-xs mt-1">{usage}</p>
        )}
      </div>
    </div>
  );
};
