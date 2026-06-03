import React, { useState } from 'react';
import { X, Download, FileJson, FileCode, Palette } from 'lucide-react';
import { exportToJSON, exportToCSS, exportToSCSS, exportToSVG, getColorFormats } from '../../utils/colorFormat';

interface ExportModalProps {
  colors: { hex: string; label?: string }[];
  onClose: () => void;
}

type ExportFormat = 'json' | 'css' | 'scss' | 'svg';

export const ExportModal: React.FC<ExportModalProps> = ({ colors, onClose }) => {
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('json');
  const [copied, setCopied] = useState(false);

  const getExportContent = (format: ExportFormat): string => {
    switch (format) {
      case 'json':
        return exportToJSON(colors);
      case 'css':
        return `:root {\n${exportToCSS(colors)}\n}`;
      case 'scss':
        return exportToSCSS(colors);
      case 'svg':
        return exportToSVG(colors);
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getExportContent(activeFormat));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const content = getExportContent(activeFormat);
    const extensions: Record<ExportFormat, string> = {
      json: 'json',
      css: 'css',
      scss: 'scss',
      svg: 'svg',
    };

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-colors.${extensions[activeFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTabs = [
    { key: 'json' as ExportFormat, label: 'JSON', icon: FileJson },
    { key: 'css' as ExportFormat, label: 'CSS', icon: FileCode },
    { key: 'scss' as ExportFormat, label: 'SCSS', icon: FileCode },
    { key: 'svg' as ExportFormat, label: 'SVG', icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">Export Colors</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-gray-400 text-black hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-border">
          {formatTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFormat(tab.key)}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                ${activeFormat === tab.key
                  ? 'text-text-primary border-b-2 border-black'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="bg-muted p-4 font-mono text-sm text-text-primary overflow-auto max-h-64 whitespace-pre">
            {getExportContent(activeFormat)}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={handleCopy}
            className="px-4 py-2 border border-border text-sm font-medium text-text-primary hover:bg-muted transition-colors"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
