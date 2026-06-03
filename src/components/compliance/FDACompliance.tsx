import React from 'react';
import { Shield, Check, AlertTriangle } from 'lucide-react';
import { ComplianceBadge } from './ComplianceBadge';

interface FDAComplianceProps {
  colors: { hex: string; rgb: [number, number, number] }[];
}

const FDA_RESTRICTED_COLORS = [
  { name: 'Citrus Red No. 2', hex: '#FF0000', reason: 'Restricted for food use' },
  { name: 'Orange B', hex: '#FFA500', reason: 'Restricted for food use' },
];

const checkFDACompliance = (hex: string): { compliant: boolean; message?: string } => {
  const restricted = FDA_RESTRICTED_COLORS.find(
    (c) => c.hex.toLowerCase() === hex.toLowerCase()
  );
  if (restricted) {
    return {
      compliant: false,
      message: `Contains ${restricted.name}: ${restricted.reason}`,
    };
  }
  return { compliant: true };
};

export const FDACompliance: React.FC<FDAComplianceProps> = ({ colors }) => {
  const results = colors.map((color) => ({
    ...color,
    ...checkFDACompliance(color.hex),
  }));

  const allCompliant = results.every((r) => r.compliant);
  const nonCompliant = results.filter((r) => !r.compliant);

  return (
    <div className="border border-border p-6 bg-white">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={20} className="text-text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">FDA Food Packaging Compliance</h3>
      </div>

      <div className="mb-6">
        {allCompliant ? (
          <ComplianceBadge
            type="fda"
            status="compliant"
            message="All colors meet FDA food packaging standards"
          />
        ) : (
          <ComplianceBadge
            type="fda"
            status="non-compliant"
            message={`${nonCompliant.length} color(s) may not meet FDA standards`}
          />
        )}
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 border ${
              result.compliant ? 'border-border bg-muted' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 border border-border"
                style={{ backgroundColor: result.hex }}
              />
              <span className="text-sm font-mono text-text-primary">{result.hex}</span>
            </div>
            <div className="flex items-center gap-2">
              {result.compliant ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <AlertTriangle size={16} className="text-red-600" />
              )}
              <span className={`text-xs ${result.compliant ? 'text-text-secondary' : 'text-red-600'}`}>
                {result.compliant ? 'Compliant' : 'Review'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-text-muted">
        <p>Note: This is a preliminary check. Final compliance should be verified with FDA guidelines.</p>
      </div>
    </div>
  );
};
