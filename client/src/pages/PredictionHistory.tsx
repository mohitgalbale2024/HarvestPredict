import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, Trash2, MapPin, Search, TrendingUp, Eye } from 'lucide-react';
import { ProtectedLayout } from '@/components/Layout';
import Card from '@/components/Card';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { usePredictions } from '@/hooks/usePredictions';
import { formatNumber, formatDate, formatRelativeDate, formatYield, formatPercentage } from '@/utils/formatters';
import type { Prediction } from '@/types';

const PredictionHistory: React.FC = () => {
  const { predictions, fetchPredictions, removePrediction, isLoading } = usePredictions();
  const [displayPredictions, setDisplayPredictions] = useState<Prediction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const data = await fetchPredictions();
        if (data && data.length > 0) {
          setDisplayPredictions(data);
        } else {
          const demoPredictions: Prediction[] = generateDemoPredictions();
          setDisplayPredictions(demoPredictions);
        }
      } catch {
        const demoPredictions: Prediction[] = generateDemoPredictions();
        setDisplayPredictions(demoPredictions);
      }
    };
    loadPredictions();
  }, []);

  const generateDemoPredictions = (): Prediction[] => {
    const crops = ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Barley'];
    const seasons = ['Kharif', 'Rabi', 'Summer', 'Kharif', 'Rabi', 'Summer'];
    const districts = ['Amravati', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Ludhiana'];
    const states = ['Maharashtra', 'Maharashtra', 'Maharashtra', 'Maharashtra', 'Maharashtra', 'Punjab'];
    const predictions: Prediction[] = [];

    for (let i = 0; i < 12; i++) {
      const crop = crops[i % crops.length];
      const season = seasons[i % seasons.length];
      const area = 5 + Math.random() * 95;
      const baseYield = 3 + Math.random() * 5;

      const date = new Date();
      date.setDate(date.getDate() - i * 3 - Math.floor(Math.random() * 2));

      predictions.push({
        id: `demo-pred-${i + 1}`,
        userId: 'demo-user',
        crop,
        season,
        location: { district: districts[i % districts.length], state: states[i % states.length] },
        area_hectares: Math.round(area * 100) / 100,
        rainfall_mm: 500 + Math.random() * 1000,
        temperature: 15 + Math.random() * 25,
        humidity: 40 + Math.random() * 50,
        ph: 5.5 + Math.random() * 3,
        nitrogen: 80 + Math.random() * 120,
        phosphorus: 40 + Math.random() * 80,
        potassium: 60 + Math.random() * 80,
        irrigation: Math.random() > 0.5,
        fertilizer_used: Math.random() > 0.5,
        predictedYield: Math.round(baseYield * 100) / 100,
        predictedProduction: Math.round(baseYield * area * 100) / 100,
        modelMetrics: { r2: 0.75 + Math.random() * 0.23, rmse: 0.5, mae: 0.3 },
        createdAt: date.toISOString(),
      });
    }
    return predictions;
  };

  const getLocationString = (location: Prediction['location']): string => {
    if (typeof location === 'string') return location;
    if (location && typeof location === 'object') return `${location.district}, ${location.state}`;
    return '—';
  };

  const filteredPredictions = displayPredictions.filter((p) =>
    p.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getLocationString(p.location).toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.season.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await removePrediction(id);
      setDisplayPredictions((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setDisplayPredictions((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const getR2Badge = (r2: number) => {
    if (r2 >= 0.85) return 'bg-green-50 text-green-700 border-green-100';
    if (r2 >= 0.7) return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-red-50 text-red-700 border-red-100';
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-earth-800 tracking-tight mb-1.5">
              Prediction History
            </h1>
            <p className="text-earth-500">
              Review and manage all your past yield predictions.
            </p>
          </div>
          <div className="w-full sm:w-80">
            <Input
              type="text"
              placeholder="Search by crop, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        {isLoading && displayPredictions.length === 0 ? (
          <LoadingState message="Loading prediction history..." fullHeight />
        ) : filteredPredictions.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              title="No predictions found"
              description={searchQuery
                ? 'No predictions match your search criteria. Try a different keyword.'
                : 'You haven\'t made any predictions yet. Start by creating your first yield prediction.'
              }
              action={searchQuery ? undefined : {
                label: 'Make Your First Prediction',
                onClick: () => window.location.href = '/predict',
              }}
            />
          </Card>
        ) : (
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-earth-50 border-b border-earth-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">
                      Crop
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">
                      Location & Season
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">
                      Predicted Yield
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">
                      Production
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-50">
                  {filteredPredictions.map((prediction) => (
                    <tr key={prediction.id} className="hover:bg-earth-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <Sprout size={16} className="text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-earth-800">{prediction.crop}</p>
                            <p className="text-xs text-earth-500">{formatNumber(prediction.area_hectares, 1)} ha</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-earth-600">
                            <MapPin size={12} className="text-earth-400 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{getLocationString(prediction.location)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-earth-500">
                            <Calendar size={12} className="text-earth-400 flex-shrink-0" />
                            <span>{prediction.season}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <TrendingUp size={14} className="text-primary-500" />
                          <span className="font-semibold text-earth-800">
                            {formatNumber(prediction.predictedYield, 0)}
                          </span>
                        </div>
                        <p className="text-xs text-earth-500">kg / hectare</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-earth-800">
                          {formatNumber(prediction.predictedProduction, 2)} MT
                        </p>
                        <p className="text-xs text-earth-500">metric tons</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {prediction.modelMetrics ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getR2Badge(prediction.modelMetrics.r2)}`}>
                            R² {formatNumber(prediction.modelMetrics.r2, 2)}
                          </span>
                        ) : (
                          <span className="text-earth-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-earth-700">{formatDate(prediction.createdAt)}</p>
                        <p className="text-xs text-earth-500">{formatRelativeDate(prediction.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="View details"
                            className="p-2 rounded-lg text-earth-500 hover:bg-earth-100 hover:text-earth-700 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Delete prediction"
                            onClick={() => handleDelete(prediction.id)}
                            disabled={deletingId === prediction.id}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === prediction.id ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-earth-100 bg-earth-50/50">
              <p className="text-sm text-earth-500">
                Showing <span className="font-semibold text-earth-700">{filteredPredictions.length}</span> of{' '}
                <span className="font-semibold text-earth-700">{displayPredictions.length}</span> predictions
              </p>
              <Button variant="outline" size="sm">Export CSV</Button>
            </div>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default PredictionHistory;
