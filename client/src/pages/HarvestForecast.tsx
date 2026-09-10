import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Sprout,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  CloudRain,
  Thermometer,
} from 'lucide-react';
import { ProtectedLayout } from '@/components/Layout';
import Card from '@/components/Card';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import Button from '@/components/Button';
import Select from '@/components/Select';
import {
  getHarvestForecast,
} from '@/services/dashboardService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { formatNumber, formatDate, formatYield } from '@/utils/formatters';

interface ForecastItem {
  crop: string;
  plantingDate: string;
  harvestDate: string;
  estimatedYield: number;
}

const CROP_COLORS: Record<string, string> = {
  Wheat: '#15803d',
  Rice: '#22c55e',
  Maize: '#65a30d',
  Soybean: '#84cc16',
  Cotton: '#a3e635',
  Sugarcane: '#bef264',
  Barley: '#4ade80',
  Potato: '#86efac',
  Tomato: '#bbf7d0',
  Onion: '#dcfce7',
};

const HarvestForecast: React.FC = () => {
  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [monthlyProduction, setMonthlyProduction] = useState<any[]>([]);

  useEffect(() => {
    const loadForecast = async () => {
      setIsLoading(true);
      try {
        const data = await getHarvestForecast();
        setForecasts(data);
        processForecastData(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadForecast();
  }, []);

  const processForecastData = (data: ForecastItem[]) => {
    const today = new Date();
    const timeline = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i * 14);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

      let production = 0;
      data.forEach((item) => {
        const harvest = new Date(item.harvestDate);
        const diff = Math.abs(harvest.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 30) {
          production += (item.estimatedYield * 10) / 1000;
        }
      });

      timeline.push({
        period: monthKey,
        production: Math.round(production * 100) / 100,
      });
    }
    setTimelineData(timeline);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const production = months.map((m, idx) => {
      const base = 200 + Math.sin((idx + 3) / 2) * 150 + Math.random() * 80;
      return {
        month: m,
        expected: Math.round(base),
        historical: Math.round(base - 20 + Math.random() * 40),
      };
    });
    setMonthlyProduction(production);
  };

  const calculateStage = (plantingDate: string, harvestDate: string): { stage: string; progress: number; color: string } => {
    const now = new Date().getTime();
    const plant = new Date(plantingDate).getTime();
    const harvest = new Date(harvestDate).getTime();
    const total = harvest - plant;
    const elapsed = now - plant;
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));

    if (progress < 25) return { stage: 'Germination', progress, color: 'bg-amber-500' };
    if (progress < 50) return { stage: 'Vegetative', progress, color: 'bg-lime-500' };
    if (progress < 75) return { stage: 'Flowering', progress, color: 'bg-primary-400' };
    if (progress < 100) return { stage: 'Maturation', progress, color: 'bg-primary-600' };
    return { stage: 'Ready to Harvest', progress: 100, color: 'bg-secondary-600' };
  };

  const getDaysToHarvest = (harvestDate: string): number => {
    const now = new Date().getTime();
    const harvest = new Date(harvestDate).getTime();
    return Math.max(0, Math.ceil((harvest - now) / (1000 * 60 * 60 * 24)));
  };

  const filteredForecasts = selectedCrop
    ? forecasts.filter((f) => f.crop === selectedCrop)
    : forecasts;

  const cropOptions = Array.from(new Set(forecasts.map((f) => f.crop))).map((c) => ({
    value: c,
    label: c,
  }));

  if (isLoading) {
    return (
      <ProtectedLayout>
        <LoadingState message="Loading harvest forecast..." fullHeight />
      </ProtectedLayout>
    );
  }

  const totalEstimatedProduction = forecasts.reduce(
    (sum, f) => sum + (f.estimatedYield * 10) / 1000,
    0
  );
  const avgDaysToHarvest =
    forecasts.length > 0
      ? Math.round(forecasts.reduce((sum, f) => sum + getDaysToHarvest(f.harvestDate), 0) / forecasts.length)
      : 0;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-earth-800 tracking-tight mb-1.5">
              Harvest Forecast
            </h1>
            <p className="text-earth-500">
              Track your crops through each growth stage and plan harvest logistics ahead of time.
            </p>
          </div>
          <div className="w-full sm:w-56">
            <Select
              label=""
              name="crop-filter"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              options={cropOptions}
              placeholder="All crops"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Active Crops"
            value={forecasts.length}
            icon={Sprout}
            changeLabel="Tracked this season"
          />
          <MetricCard
            title="Total Expected Production"
            value={formatNumber(totalEstimatedProduction, 1)}
            icon={TrendingUp}
            suffix=" MT"
            change={6.8}
          />
          <MetricCard
            title="Avg. Days to Harvest"
            value={avgDaysToHarvest}
            icon={Clock}
            suffix=" days"
            changeLabel="Time remaining"
          />
          <MetricCard
            title="Next Harvest"
            value={
              forecasts.length > 0
                ? formatDate(
                    forecasts.reduce((earliest, f) =>
                      new Date(f.harvestDate) < new Date(earliest.harvestDate) ? f : earliest
                    ).harvestDate
                  )
                : 'N/A'
            }
            icon={CalendarDays}
            changeLabel="Upcoming date"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <ChartCard
            title="Production Timeline"
            subtitle="Estimated output by harvest period"
            className="lg:col-span-2"
            height="320px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} MT`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: any) => [`${formatNumber(value, 1)} MT`, 'Production']}
                />
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="#15803d"
                  strokeWidth={3}
                  fill="url(#productionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Monthly Yield (MT)"
            subtitle="Expected vs historical"
            height="320px"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProduction} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="expected" name="Expected" fill="#15803d" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar dataKey="historical" name="Last Year" fill="#a8a29e" radius={[4, 4, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-earth-800">Crop Growth Timeline</h2>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight size={14} />}>
              View All Stages
            </Button>
          </div>

          <div className="space-y-4">
            {filteredForecasts.map((item, idx) => {
              const stageInfo = calculateStage(item.plantingDate, item.harvestDate);
              const daysLeft = getDaysToHarvest(item.harvestDate);
              return (
                <Card key={`${item.crop}-${idx}`} padding="lg" hover>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    <div className="flex items-center gap-4 lg:w-48 flex-shrink-0">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                        style={{ backgroundColor: CROP_COLORS[item.crop] || '#15803d' }}
                      >
                        {item.crop.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-earth-800 text-lg">{item.crop}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                          stageInfo.progress === 100
                            ? 'bg-secondary-50 text-secondary-700'
                            : 'bg-primary-50 text-primary-700'
                        }`}>
                          {stageInfo.progress === 100 ? <CheckCircle2 size={12} /> : <Sprout size={12} />}
                          {stageInfo.stage}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 lg:px-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-earth-600">Growth Progress</p>
                        <p className="text-sm font-bold text-earth-800">{Math.round(stageInfo.progress)}%</p>
                      </div>
                      <div className="w-full h-3 bg-earth-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${stageInfo.color} transition-all duration-700`}
                          style={{ width: `${stageInfo.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-earth-500">
                        <span>Planted: {formatDate(item.plantingDate)}</span>
                        <span>Harvest: {formatDate(item.harvestDate)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 lg:w-auto lg:grid-cols-1 lg:gap-1.5 lg:text-right">
                      <div className="p-3 rounded-xl bg-earth-50">
                        <div className="flex lg:justify-end items-center gap-1.5 text-xs text-earth-500 mb-1">
                          <TrendingUp size={12} />
                          Est. Yield
                        </div>
                        <p className="lg:text-right font-bold text-earth-800">
                          {formatYield(item.estimatedYield)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50">
                        <div className="flex lg:justify-end items-center gap-1.5 text-xs text-blue-600 mb-1">
                          <CloudRain size={12} />
                          Rainfall
                        </div>
                        <p className="lg:text-right font-bold text-blue-700">850 mm</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50">
                        <div className="flex lg:justify-end items-center gap-1.5 text-xs text-amber-700 mb-1">
                          <Clock size={12} />
                          Days Left
                        </div>
                        <p className="lg:text-right font-bold text-amber-800">{daysLeft} days</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export default HarvestForecast;
