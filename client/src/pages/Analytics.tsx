import React, { useState, useEffect } from 'react';
import { BarChart2, Target, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { ProtectedLayout } from '@/components/Layout';
import ChartCard from '@/components/ChartCard';
import Card from '@/components/Card';
import MetricCard from '@/components/MetricCard';
import LoadingState from '@/components/LoadingState';
import { formatNumber, formatPercentage } from '@/utils/formatters';

const RAINFALL_COLOR = '#3b82f6';
const YIELD_COLORS = ['#15803d', '#22c55e', '#65a30d', '#a3e635', '#84cc16', '#bef264'];

const Analytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [yieldByRainfall, setYieldByRainfall] = useState<any[]>([]);
  const [yieldByTemp, setYieldByTemp] = useState<any[]>([]);
  const [cropDistribution, setCropDistribution] = useState<any[]>([]);
  const [nutrientCorrelation, setNutrientCorrelation] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 800));

      const rainfallData = [];
      for (let i = 0; i < 15; i++) {
        const rainfall = 200 + i * 60 + Math.random() * 50;
        rainfallData.push({
          rainfall: Math.round(rainfall),
          yield: Math.round(2500 + rainfall * 3.5 - Math.pow(i - 7, 2) * 20 + Math.random() * 300),
        });
      }
      setYieldByRainfall(rainfallData);

      const tempData = [];
      for (let t = 10; t <= 38; t += 2) {
        tempData.push({
          temperature: `${t}°C`,
          tempValue: t,
          yield: Math.round(3000 + Math.sin((t - 15) / 8) * 2000 + Math.random() * 200),
        });
      }
      setYieldByTemp(tempData);

      setCropDistribution([
        { name: 'Wheat', value: 28, color: '#15803d' },
        { name: 'Rice', value: 22, color: '#22c55e' },
        { name: 'Maize', value: 18, color: '#65a30d' },
        { name: 'Soybean', value: 14, color: '#a3e635' },
        { name: 'Cotton', value: 10, color: '#84cc16' },
        { name: 'Others', value: 8, color: '#bef264' },
      ]);

      const nutrientData = [];
      for (let n = 20; n <= 200; n += 10) {
        nutrientData.push({
          nitrogen: n,
          yield: Math.round(2800 + Math.log(n) * 800 - n * 0.5 + Math.random() * 300),
          z: 50 + Math.random() * 100,
        });
      }
      setNutrientCorrelation(nutrientData);

      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <ProtectedLayout>
        <LoadingState message="Loading analytics data..." fullHeight />
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-earth-800 tracking-tight mb-1.5">
            Deep Analytics
          </h1>
          <p className="text-earth-500">
            Explore how different agricultural factors influence yield outcomes with data visualizations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Model R² Score"
            value={formatNumber(0.892, 3)}
            icon={Target}
            change={2.1}
            changeLabel="vs last month"
          />
          <MetricCard
            title="Avg. Yield Increase"
            value="12.4"
            icon={TrendingUp}
            suffix="%"
            change={3.2}
            changeLabel="YoY improvement"
          />
          <MetricCard
            title="Prediction Volume"
            value={formatInteger(1487)}
            icon={BarChart2}
            change={18.7}
          />
          <MetricCard
            title="Error Rate (MAE)"
            value={formatNumber(142.8, 1)}
            icon={TrendingDown}
            change={-5.4}
            changeLabel="Improvement"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <ChartCard
            title="Rainfall vs Yield"
            subtitle="How precipitation impacts crop output"
            className="lg:col-span-2"
            height="340px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  type="number"
                  dataKey="rainfall"
                  name="Rainfall"
                  unit=" mm"
                  tick={{ fontSize: 12, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                  label={{ value: 'Rainfall (mm)', position: 'insideBottom', offset: -5, fill: '#78716c', fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="yield"
                  name="Yield"
                  unit=" kg/ha"
                  tick={{ fontSize: 12, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatNumber(v, 0)}
                />
                <ZAxis type="number" dataKey="z" range={[40, 200]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'Yield' ? formatNumber(value, 0) + ' kg/ha' : value + ' mm',
                    name,
                  ]}
                />
                <Scatter name="Predictions" data={yieldByRainfall} fill="#15803d" opacity={0.7}>
                  {yieldByRainfall.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={YIELD_COLORS[index % YIELD_COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Crop Distribution"
            subtitle="Share of predictions by crop"
            height="340px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatPercentage(value) + ' share', '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <ChartCard
            title="Temperature Impact on Yield"
            subtitle="Average yield by temperature range"
            height="320px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldByTemp} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="temperature"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value, 0)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any) => [formatNumber(value, 0) + ' kg/ha', 'Avg Yield']}
                />
                <Bar dataKey="yield" radius={[6, 6, 0, 0]} barSize={22}>
                  {yieldByTemp.map((entry, index) => {
                    const intensity = Math.abs(entry.tempValue - 25);
                    const opacity = intensity < 5 ? 1 : intensity < 10 ? 0.75 : 0.5;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={RAINFALL_COLOR}
                        fillOpacity={opacity}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Nitrogen vs Yield Trend"
            subtitle="Correlation between N fertilizer and output"
            height="320px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={nutrientCorrelation} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nitrogenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#65a30d" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#65a30d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="nitrogen"
                  tick={{ fontSize: 12, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                  label={{ value: 'Nitrogen (kg/ha)', position: 'insideBottom', offset: -5, fill: '#78716c', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value, 0)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'yield' ? formatNumber(value, 0) + ' kg/ha' : value + ' kg/ha',
                    name === 'yield' ? 'Yield' : 'Nitrogen',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="yield"
                  stroke="#65a30d"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: '#65a30d', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <Card padding="lg">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <PieChartIcon size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-earth-800">Key Statistical Insights</h2>
              <p className="text-sm text-earth-500 mt-0.5">Summary of model performance and correlation analysis</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                label: 'Rainfall Correlation',
                value: '0.78',
                description: 'Strong positive correlation (r) between seasonal rainfall and final yield.',
                positive: true,
              },
              {
                label: 'Optimal Temp Range',
                value: '22-28°C',
                description: 'Temperature sweet spot for maximum photosynthesis and growth.',
                positive: true,
              },
              {
                label: 'N Saturation Point',
                value: '160 kg/ha',
                description: 'Beyond this level, additional N gives diminishing returns.',
                positive: true,
              },
              {
                label: 'pH Optimum',
                value: '6.0-7.0',
                description: 'Neutral to slightly acidic soils maximize nutrient availability.',
                positive: true,
              },
              {
                label: 'Humidity Sweet Spot',
                value: '60-75%',
                description: 'Balanced humidity reduces disease pressure and evapotranspiration.',
                positive: true,
              },
              {
                label: 'P:K Optimal Ratio',
                value: '2:3',
                description: 'Phosphorus to Potassium ratio for balanced root & fruit development.',
                positive: true,
              },
            ].map((insight, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-earth-50 border border-earth-100">
                <p className="text-xs font-medium text-earth-500 uppercase tracking-wide mb-1.5">
                  {insight.label}
                </p>
                <p className="text-2xl font-bold text-earth-800 mb-2">{insight.value}</p>
                <p className="text-sm text-earth-600 leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ProtectedLayout>
  );
};

const formatInteger = (value: number): string => {
  return Math.round(value).toLocaleString('en-US');
};

export default Analytics;
