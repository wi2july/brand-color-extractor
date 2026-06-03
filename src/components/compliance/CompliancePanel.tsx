import React, { useState } from 'react';
import { FileText, Download, X } from 'lucide-react';
import { ContrastChecker } from './ContrastChecker';
import { FDACompliance } from './FDACompliance';

interface CompliancePanelProps {
  colors: { hex: string; rgb: [number, number, number] }[];
  onClose: () => void;
}

type TabType = 'wcag' | 'fda';

export const CompliancePanel: React.FC<CompliancePanelProps> = ({ colors, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('wcag');

  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      colors: colors.map((c) => c.hex),
      wcag: 'Checked',
      fda: 'Checked',
      disclaimer: 'This report is for reference only and does not constitute legal advice.',
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compliance-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">Compliance Check</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateReport}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:opacity-80 transition-opacity"
            >
              <Download size={16} />
              Export Report
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border border-gray-400 text-black hover:bg-gray-100 transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('wcag')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'wcag'
                ? 'text-text-primary border-b-2 border-black'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            WCAG Accessibility
          </button>
          <button
            onClick={() => setActiveTab('fda')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'fda'
                ? 'text-text-primary border-b-2 border-black'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            FDA Compliance
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'wcag' && (
            <div className="space-y-6">
              <p className="text-text-secondary text-sm">
                Check color contrast ratios against WCAG 2.1 standards for accessibility compliance.
              </p>
              {colors.length > 0 && (
                <ContrastChecker
                  foregroundColor={colors[0].hex}
                  backgroundColor={colors[colors.length - 1]?.hex || '#FFFFFF'}
                />
              )}
            </div>
          )}

          {activeTab === 'fda' && (
            <div className="space-y-6">
              <p className="text-text-secondary text-sm">
                Verify colors meet FDA food packaging safety standards.
              </p>
              <FDACompliance colors={colors} />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-muted">
          <p className="text-xs text-text-muted">
            Disclaimer: This compliance check is for reference purposes only and does not constitute legal advice.
            Final compliance should be verified with official FDA and WCAG guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
