import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = 'vs last period',
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={`card-hover ${className}`} padding="lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-earth-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-earth-800 tracking-tight">
            {prefix}
            {value}
            {suffix}
          </p>
          {change !== undefined && (
            <div className="mt-3 flex items-center gap-1.5">
              {isPositive ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  <TrendingUp size={14} className="mr-1" />
                  +{change}%
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  <TrendingDown size={14} className="mr-1" />
                  {change}%
                </span>
              )}
              <span className="text-xs text-earth-400">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <Icon size={24} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
