import React, { useState } from 'react';
import { ColorCard } from './ColorCard';
import { ColorValueCard } from './ColorValueCard';
import { ExportModal } from './ExportModal';

interface ColorData {
  hex: string;
  rgb: [number, number, number];
}

interface ColorPaletteProps {
  colors: ColorData[];
  onExport?: () => void;
}

const categorizeColors = (colors: ColorData[]) => {
  if (colors.length === 0) {
    return { primary: [], secondary: [], neutral: [], accent: [] };
  }

  const colorsWithMetrics = colors.map((color) => {
    const [r, g, b] = color.rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const brightness = (r + g + b) / (3 * 255);
    return { color, saturation, brightness };
  });

  const primary: ColorData[] = [];
  const secondary: ColorData[] = [];
  const neutral: ColorData[] = [];
  const accent: ColorData[] = [];

  const sortedBySaturation = [...colorsWithMetrics].sort((a, b) => b.saturation - a.saturation);
  const sortedByBrightness = [...colorsWithMetrics].sort((a, b) => b.brightness - a.brightness);

  const vibrantColors = sortedBySaturation.filter((c) => c.saturation > 0.3);
  const mutedColors = sortedBySaturation.filter((c) => c.saturation <= 0.3);

  if (vibrantColors.length >= 1) {
    primary.push(vibrantColors[0].color);
  }
  if (vibrantColors.length >= 2) {
    secondary.push(vibrantColors[1].color);
  }
  if (vibrantColors.length >= 3) {
    secondary.push(vibrantColors[2].color);
  }
  if (vibrantColors.length >= 4) {
    accent.push(vibrantColors[3].color);
  }

  if (primary.length === 0 && colors.length > 0) {
    primary.push(colors[0]);
  }

  const darkColors = sortedByBrightness.filter((c) => c.brightness < 0.3).slice(0, 2);
  const lightColors = sortedByBrightness.filter((c) => c.brightness > 0.8).slice(0, 2);
  const midColors = mutedColors.filter((c) => c.brightness >= 0.3 && c.brightness <= 0.8).slice(0, 2);

  neutral.push(...darkColors.map((c) => c.color));
  neutral.push(...lightColors.map((c) => c.color));
  neutral.push(...midColors.map((c) => c.color));

  if (neutral.length === 0 && colors.length > 0) {
    neutral.push(colors[colors.length - 1]);
  }

  return {
    primary: primary.slice(0, 2),
    secondary: secondary.slice(0, 2),
    neutral: neutral.slice(0, 4),
    accent: accent.slice(0, 2),
  };
};

const getUsageLabel = (category: string, index: number): string => {
  const labels: Record<string, string[]> = {
    primary: ['Primary Brand Color', 'Secondary Brand Color', 'Tertiary Brand Color'],
    secondary: ['Supporting Color 1', 'Supporting Color 2', 'Supporting Color 3'],
    neutral: ['Dark Neutral', 'Light Neutral', 'Mid Neutral', 'Soft Neutral'],
    accent: ['Accent Color 1', 'Accent Color 2'],
  };
  return labels[category]?.[index] || '';
};

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  onExport,
}) => {
  const categorized = categorizeColors(colors);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showColorDetails, setShowColorDetails] = useState<string | null>(null);

  const allColors = [
    ...categorized.primary.map((c, i) => ({ ...c, label: `Primary ${i + 1}` })),
    ...categorized.secondary.map((c, i) => ({ ...c, label: `Secondary ${i + 1}` })),
    ...categorized.neutral.map((c, i) => ({ ...c, label: `Neutral ${i + 1}` })),
    ...categorized.accent.map((c, i) => ({ ...c, label: `Accent ${i + 1}` })),
  ];

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-text-primary">
          Brand Color Palette
        </h2>
        <button
          onClick={handleExport}
          className="px-6 py-2.5 bg-black text-white text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Export Colors
        </button>
      </div>

      {showExportModal && (
        <ExportModal
          colors={allColors}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showColorDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Color Details</h3>
              <button
                onClick={() => setShowColorDetails(null)}
                className="w-8 h-8 flex items-center justify-center border border-gray-400 text-black hover:bg-gray-100 transition-all"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ColorValueCard hex={showColorDetails} />
            </div>
          </div>
        </div>
      )}

      {/* All Colors - 显示所有颜色（包括手动添加的） */}
      {colors.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
            All Colors ({colors.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {colors.map((color, index) => (
              <div key={`all-${index}-${color.hex}`} onClick={() => setShowColorDetails(color.hex)} className="cursor-pointer">
                <ColorCard
                  color={color.hex}
                  label={`Color ${index + 1}`}
                  usage={index < colors.length - 1 ? "Extracted" : "Manual"}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {categorized.primary.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
            Primary Colors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categorized.primary.map((color, index) => (
              <div key={`primary-${index}`} onClick={() => setShowColorDetails(color.hex)} className="cursor-pointer">
                <ColorCard
                  color={color.hex}
                  label={getUsageLabel('primary', index)}
                  usage="Brand Identity"
                  size="md"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {categorized.secondary.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
            Secondary Colors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categorized.secondary.map((color, index) => (
              <div key={`secondary-${index}`} onClick={() => setShowColorDetails(color.hex)} className="cursor-pointer">
                <ColorCard
                  color={color.hex}
                  label={getUsageLabel('secondary', index)}
                  usage="UI Elements"
                  size="md"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {categorized.neutral.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
            Neutral Colors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categorized.neutral.map((color, index) => (
              <div key={`neutral-${index}`} onClick={() => setShowColorDetails(color.hex)} className="cursor-pointer">
                <ColorCard
                  color={color.hex}
                  label={getUsageLabel('neutral', index)}
                  usage="Backgrounds & Text"
                  size="md"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {categorized.accent.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
            Accent Colors
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categorized.accent.map((color, index) => (
              <div key={`accent-${index}`} onClick={() => setShowColorDetails(color.hex)} className="cursor-pointer">
                <ColorCard
                  color={color.hex}
                  label={getUsageLabel('accent', index)}
                  usage="Highlights & CTAs"
                  size="md"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
