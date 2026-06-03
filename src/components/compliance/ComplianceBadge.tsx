import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface ComplianceBadgeProps {
  type: 'fda' | 'wcag' | 'industry';
  status: 'compliant' | 'non-compliant' | 'warning';
  message?: string;
}

const config = {
  fda: {
    label: 'FDA',
    compliant: { text: 'FDA Compliant', icon: Check },
    'non-compliant': { text: 'FDA Non-Compliant', icon: X },
    warning: { text: 'FDA Review', icon: AlertTriangle },
  },
  wcag: {
    label: 'WCAG',
    compliant: { text: 'WCAG AA Pass', icon: Check },
    'non-compliant': { text: 'WCAG Fail', icon: X },
    warning: { text: 'WCAG Review', icon: AlertTriangle },
  },
  industry: {
    label: 'Industry',
    compliant: { text: 'Compliant', icon: Check },
    'non-compliant': { text: 'Restricted', icon: X },
    warning: { text: 'Caution', icon: AlertTriangle },
  },
};

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  type,
  status,
  message,
}) => {
  const { label, ...statusConfig } = config[type];
  const { text, icon: Icon } = statusConfig[status];

  const bgColors = {
    compliant: 'bg-green-50 border-green-200',
    'non-compliant': 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  const iconColors = {
    compliant: 'text-green-600',
    'non-compliant': 'text-red-600',
    warning: 'text-yellow-600',
  };

  const textColors = {
    compliant: 'text-green-800',
    'non-compliant': 'text-red-800',
    warning: 'text-yellow-800',
  };

  return (
    <div className={`border ${bgColors[status]} p-3`}>
      <div className="flex items-center gap-2">
        <Icon size={16} className={iconColors[status]} />
        <span className={`text-sm font-medium ${textColors[status]}`}>{text}</span>
      </div>
      {message && (
        <p className={`text-xs mt-1 ${textColors[status]}`}>{message}</p>
      )}
    </div>
  );
};
