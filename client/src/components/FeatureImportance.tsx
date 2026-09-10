import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { FeatureImportanceItem } from '@/types';
import { Card, CardHeader, CardBody } from './Card';

interface FeatureImportanceProps {
  data: FeatureImportanceItem[];
  title?: string;
  className?: string;
}

const COLORS = [
  '#15803d',
  '#22c55e',
  '#4ade80',
  '#65a30d',
  '#84cc16',
  '#a3e635',
  '#bef264',
  '#d9f99d',
  '#86efac',
  '#bbf7d0',
];

export const FeatureImportance: React.FC<FeatureImportanceProps> = ({
  data,
  title = 'Feature Importance',
  className = '',
}) => {
  const sortedData = [...data].sort((a, b) => b.importance - a.importance);

  return (
    <Card className={className} padding="lg">
      <CardHeader
        title={title}
        subtitle="Key factors influencing the prediction"
      />
      <CardBody>
        <div style={{ height: '300px' }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: '#78716c' }}
                tickLine={false}
                axisLine={{ stroke: '#e7e5e4' }}
              />
              <YAxis
                dataKey="feature"
                type="category"
                width={100}
                tick={{ fontSize: 12, fill: '#57534e' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e7e5e4',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
                labelStyle={{ color: '#57534e', fontWeight: 600 }}
              />
              <Bar
                dataKey="importance"
                radius={[0, 6, 6, 0]}
                barSize={18}
              >
                {sortedData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {sortedData.slice(0, 4).map((item, idx) => (
            <div key={item.feature} className="flex items-center gap-3 p-3 rounded-lg bg-earth-50">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-earth-700 truncate">{item.feature}</p>
                <p className="text-xs text-earth-500">{(item.importance * 100).toFixed(1)}% influence</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default FeatureImportance;
