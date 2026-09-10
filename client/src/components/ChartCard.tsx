import React, { type ReactNode } from 'react';
import { Card, CardHeader, CardBody } from './Card';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  height?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  action,
  className = '',
  height = '320px',
}) => {
  return (
    <Card className={`card-hover ${className}`} padding="lg">
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <CardBody>
        <div style={{ height }} className="w-full">
          {children}
        </div>
      </CardBody>
    </Card>
  );
};

export default ChartCard;
