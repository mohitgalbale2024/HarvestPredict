import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  TrendingUp,
  BarChart3,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ProtectedLayout } from '@/components/Layout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from 'recharts';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import Card from '@/components/Card';
import LoadingState from '@/components/LoadingState';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  getDashboardStats,
  getYieldTrend,
  getCropComparison,
  getSeasonalRadar,
} from '@/services/dashboardService';
import { formatNumber, formatDate, formatYield } from '@/utils/formatters';
import type {
  DashboardStats,
  YieldTrendDataPoint,
  CropComparisonDataPoint,
  SeasonalRadarDataPoint,
} from '@/types';

const CROP_COLORS = ['#15803d', '#22c55e', '#4ade80', '#65a30d', '#a3e635', '#84cc16'];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [yieldTrend, setYieldTrend] = useState<YieldTrendDataPoint[]>([]);
  const [cropComparison, setCropComparison] = useState<CropComparisonDataPoint[]>([]);
  const [seasonalRadar, setSeasonalRadar] = useState<SeasonalRadarDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, trendData, cropData, radarData] = await Promise.all([
          getDashboardStats(),
          getYieldTrend(),
          getCropComparison(),
          getSeasonalRadar(),
        ]);
        setStats(statsData);
        setYieldTrend(trendData);
        setCropComparison(cropData);
        setSeasonalRadar(radarData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <ProtectedLayout>
        <LoadingState message="Loading dashboard..." fullHeight />
      </ProtectedLayout>
    );
  }

  const displayStats: DashboardStats = stats || {
    totalPredictions: 0,
    averageYield: 0,
    mostAnalyzedCrop: '—',
    latestPrediction: null,
    cropCounts: {},
    soilAverages: {},
    weatherAverages: {},
  };

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-earth-800 tracking-tight mb-1.5">
              Good to see you, {user?.name?.split(' ')[0] || 'Farmer'} 👋
            </h1>
            <p className="text-earth-500">
              Here's what's happening with your yield predictions today.
            </p>
          </div>
          <Link to="/predict">
            <Button variant="primary" size="md" rightIcon={<Sparkles size={16} />}>
              New Prediction
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total Predictions"
            value={formatIntegerDisplay(displayStats.totalPredictions)}
            icon={BarChart3}
            change={12.5}
          />
          <MetricCard
            title="Average Yield"
            value={`${formatNumber(displayStats.averageYield, 2)} t/ha`}
            icon={Sprout}
            change={displayStats.averageYield > 0 ? 8.2 : undefined}
          />
          <MetricCard
            title="Most Analyzed Crop"
            value={displayStats.mostAnalyzedCrop}
            icon={TrendingUp}
            changeLabel="Top performer"
          />
          <MetricCard
            title="Latest Prediction"
            value={
              displayStats.latestPrediction
                ? formatDate((displayStats.latestPrediction as any).createdAt)
                : '—'
            }
            icon={Calendar}
            changeLabel={displayStats.latestPrediction ? 'Recently made' : 'No predictions yet'}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <ChartCard
            title="Yield Trend Over Time"
            subtitle="Monthly average yield predictions"
            className="lg:col-span-2"
            height="340px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#78716c' }}
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
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any) => [formatYield(value), 'Avg Yield']}
                  labelStyle={{ color: '#57534e', fontWeight: 600, marginBottom: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="yield"
                  stroke="#15803d"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#15803d', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#15803d', strokeWidth: 3, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Seasonal Performance"
            subtitle="Yield suitability by season"
            height="340px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={seasonalRadar}>
                <PolarGrid stroke="#e7e5e4" />
                <PolarAngleAxis
                  dataKey="season"
                  tick={{ fontSize: 11, fill: '#57534e' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#a8a29e' }}
                />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#15803d"
                  fill="#15803d"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any) => [`${value}/100`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <ChartCard
            title="Crop Yield Comparison"
            subtitle="Average yield by crop type"
            className="lg:col-span-2"
            height="320px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropComparison} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="crop"
                  tick={{ fontSize: 12, fill: '#78716c' }}
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
                  formatter={(value: any) => [formatYield(value), 'Avg Yield']}
                  labelStyle={{ color: '#57534e', fontWeight: 600 }}
                />
                <Bar dataKey="yield" radius={[8, 8, 0, 0]} barSize={40}>
                  {cropComparison.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card padding="lg" hover>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-earth-800">Quick Actions</h3>
                  <p className="text-sm text-earth-500 mt-1">Start predicting in one click</p>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <Link to="/predict" className="block">
                  <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-all group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center text-white">
                        <Sparkles size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-primary-800 group-hover:text-primary-900">
                          Predict Crop Yield
                        </p>
                        <p className="text-xs text-primary-700/70 mt-0.5">
                          Enter agri parameters for AI prediction
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-primary-600 mt-1" />
                    </div>
                  </div>
                </Link>
                <Link to="/harvest-forecast" className="block">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-all group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-amber-800 group-hover:text-amber-900">
                          Harvest Forecast
                        </p>
                        <p className="text-xs text-amber-700/70 mt-0.5">
                          View production timeline & estimates
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-amber-600 mt-1" />
                    </div>
                  </div>
                </Link>
                <Link to="/insights" className="block">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                        <TrendingUp size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-800 group-hover:text-blue-900">
                          Farming Insights
                        </p>
                        <p className="text-xs text-blue-700/70 mt-0.5">
                          AI recommendations for your farm
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-blue-600 mt-1" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
};

const formatIntegerDisplay = (value: number): string => {
  return Math.round(value).toLocaleString('en-US');
};

export default Dashboard;
