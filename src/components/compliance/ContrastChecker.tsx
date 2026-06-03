import React, { useState, useMemo } from 'react';
import { Eye, Info } from 'lucide-react';
import { ComplianceBadge } from './ComplianceBadge';
import { hexToRgb } from '../../utils/colorFormat';

interface ContrastCheckerProps {
  foregroundColor: string;
  backgroundColor: string;
}

const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastRatio = (color1: string, color2: string): number => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({
  foregroundColor,
  backgroundColor,
}) => {
  const [fgInput, setFgInput] = useState(foregroundColor || '#000000');
  const [bgInput, setBgInput] = useState(backgroundColor || '#FFFFFF');

  const ratio = useMemo(() => {
    try {
      return getContrastRatio(fgInput, bgInput);
    } catch {
      return 1;
    }
  }, [fgInput, bgInput]);

  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3;
  const aaaNormal = ratio >= 7;
  const aaaLarge = ratio >= 4.5;

  const getStatus = () => {
    if (aaaNormal) return 'compliant';
    if (aaNormal) return 'warning';
    return 'non-compliant';
  };

  const getMessage = () => {
    if (aaaNormal) return 'Meets WCAG AAA standards for all text sizes';
    if (aaNormal) return 'Meets WCAG AA standards. AAA requires higher contrast';
    if (aaLarge) return 'Only suitable for large text (18pt+ or 14pt bold)';
    return 'Does not meet WCAG accessibility standards';
  };

  return (
    <div className="border border-border p-6 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <Eye size={20} className="text-text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">WCAG Contrast Checker</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-text-secondary mb-2">Foreground</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={fgInput}
              onChange={(e) => setFgInput(e.target.value)}
              className="w-10 h-10 border border-border cursor-pointer"
            />
            <input
              type="text"
              value={fgInput.toUpperCase()}
              onChange={(e) => setFgInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-border text-sm font-mono uppercase"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={bgInput}
              onChange={(e) => setBgInput(e.target.value)}
              className="w-10 h-10 border border-border cursor-pointer"
            />
            <input
              type="text"
              value={bgInput.toUpperCase()}
              onChange={(e) => setBgInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-border text-sm font-mono uppercase"
            />
          </div>
        </div>
      </div>

      <div
        className="p-6 mb-6 border border-border"
        style={{ backgroundColor: bgInput }}
      >
        <p
          className="text-lg"
          style={{ color: fgInput }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
        <p
          className="text-sm mt-2"
          style={{ color: fgInput }}
        >
          Sample text for contrast preview
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-3xl font-bold text-text-primary">{ratio.toFixed(2)}</span>
          <span className="text-text-secondary text-sm ml-2">contrast ratio</span>
        </div>
        <ComplianceBadge type="wcag" status={getStatus()} message={getMessage()} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className={`p-3 border ${aaNormal ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="font-medium text-text-primary">AA Normal Text</div>
          <div className={`text-xs mt-1 ${aaNormal ? 'text-green-700' : 'text-red-700'}`}>
            {aaNormal ? 'Pass (4.5:1)' : 'Fail'}
          </div>
        </div>
        <div className={`p-3 border ${aaLarge ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="font-medium text-text-primary">AA Large Text</div>
          <div className={`text-xs mt-1 ${aaLarge ? 'text-green-700' : 'text-red-700'}`}>
            {aaLarge ? 'Pass (3:1)' : 'Fail'}
          </div>
        </div>
        <div className={`p-3 border ${aaaNormal ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className="font-medium text-text-primary">AAA Normal Text</div>
          <div className={`text-xs mt-1 ${aaaNormal ? 'text-green-700' : 'text-yellow-700'}`}>
            {aaaNormal ? 'Pass (7:1)' : 'Fail'}
          </div>
        </div>
        <div className={`p-3 border ${aaaLarge ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <div className="font-medium text-text-primary">AAA Large Text</div>
          <div className={`text-xs mt-1 ${aaaLarge ? 'text-green-700' : 'text-yellow-700'}`}>
            {aaaLarge ? 'Pass (4.5:1)' : 'Fail'}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 mt-4 text-xs text-text-muted">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>WCAG 2.1 requires minimum 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt bold)</p>
      </div>
    </div>
  );
};
