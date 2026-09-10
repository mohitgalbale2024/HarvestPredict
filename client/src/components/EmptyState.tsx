import React, { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileSearch } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileSearch,
  title,
  description,
  action,
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center py-16 px-4 text-center
        ${className}
      `}
    >
      <div className="w-16 h-16 rounded-2xl bg-earth-50 flex items-center justify-center mb-5">
        <Icon size={32} className="text-earth-400" />
      </div>
      <h3 className="text-lg font-semibold text-earth-800 mb-2">{title}</h3>
      {description && (
        <p className="text-earth-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick} size="md">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
};

export default EmptyState;
