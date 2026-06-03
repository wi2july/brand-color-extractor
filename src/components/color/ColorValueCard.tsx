import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { getColorFormats } from '../../utils/colorFormat';

interface ColorValueCardProps {
  hex: string;
}

export const ColorValueCard: React.FC<ColorValueCardProps> = ({ hex }) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const formats = getColorFormats(hex);

  const handleCopy = async (format: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatItems = [
    { key: 'hex', label: 'HEX', value: formats.hex },
    { key: 'rgb', label: 'RGB', value: formats.rgb },
    { key: 'hsl', label: 'HSL', value: formats.hsl },
    { key: 'cmyk', label: 'CMYK', value: formats.cmyk },
  ];

  return (
    <div className="border border-border p-4 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 border border-border"
          style={{ backgroundColor: hex }}
        />
        <span className="text-sm font-medium text-text-primary">{hex}</span>
      </div>

      <div className="space-y-2">
        {formatItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-2 px-3 bg-muted hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-text-secondary uppercase w-12">
                {item.label}
              </span>
              <span className="text-sm font-mono text-text-primary">
                {item.value}
              </span>
            </div>
            <button
              onClick={() => handleCopy(item.key, item.value)}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              {copiedFormat === item.key ? (
                <>
                  <Check size={12} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
