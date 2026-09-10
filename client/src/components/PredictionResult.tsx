import React from 'react';
import {
  Sprout,
  Target,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Gauge,
  Scale,
  Calendar,
  MapPin,
  Warehouse,
  Truck,
  Info,
} from 'lucide-react';
import type { Prediction, ModelMetrics, FeatureImportanceItem } from '@/types';
import { formatNumber, formatPercentage, formatDate, formatProduction, formatYield } from '@/utils/formatters';
import Card from './Card';
import FeatureImportance from './FeatureImportance';

interface PredictionResultProps {
  prediction: Prediction;
  metrics: ModelMetrics;
  featureImportance: FeatureImportanceItem[];
}

/** R² → qualitative confidence label */
function getR2Label(r2: number): string {
  if (r2 >= 0.95) return 'Very High';
  if (r2 >= 0.85) return 'High';
  if (r2 >= 0.70) return 'Moderate';
  if (r2 >= 0.50) return 'Fair';
  return 'Low';
}

/** R² → gradient class */
function getR2Gradient(r2: number): string {
  if (r2 >= 0.85) return 'from-green-500 to-emerald-600';
  if (r2 >= 0.70) return 'from-amber-500 to-orange-500';
  return 'from-red-500 to-rose-600';
}

/** R² → badge class */
function getR2BadgeClass(r2: number): string {
  if (r2 >= 0.85) return 'bg-green-100 text-green-700';
  if (r2 >= 0.70) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

/** Format location for display */
function formatLocation(loc: Prediction['location']): string {
  if (!loc) return '—';
  if (typeof loc === 'string') return loc;
  const parts = [loc.district, loc.state].filter(Boolean);
  return parts.join(', ') || '—';
}

export const PredictionResult: React.FC<PredictionResultProps> = ({
  prediction,
  metrics,
  featureImportance,
}) => {
  const r2 = metrics.r2 ?? 0;
  const r2Label = getR2Label(r2);
  const area = prediction.area_hectares ?? 0;
  const production = prediction.predictedProduction ?? 0;

  // Agricultural planning estimates (clearly documented)
  const storageReq = Math.ceil(production * 1.08); // +8% buffer for handling loss
  const loadsNeeded = Math.ceil(production / 25);   // standard 25-ton truck load

  return (
    <div className="space-y-6">
      <Card padding="none">
        {/* Header gradient */}
        <div className={`bg-gradient-to-r ${getR2Gradient(r2)} rounded-t-2xl p-8`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={20} className="text-white/90" />
                <span className="text-white/90 text-sm font-medium">Prediction Complete</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">Yield Analysis Results</h2>
              <p className="text-white/75 text-sm">
                AI-powered forecast — {prediction.crop} · {prediction.season} · {formatLocation(prediction.location)}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-white/95 ${getR2BadgeClass(r2)}`}
              >
                <Target size={14} />
                Model R²: {r2Label} ({formatNumber(r2, 3)})
              </div>
              {prediction.modelVersion && (
                <p className="text-white/60 text-xs mt-1.5">Model v{prediction.modelVersion}</p>
              )}
            </div>
          </div>
        </div>

        {/* Yield numbers + model performance */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Primary metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-primary-50 border border-primary-100">
                <div className="flex items-center gap-2 mb-2 text-primary-700">
                  <Sprout size={18} />
                  <span className="text-sm font-medium">Predicted Yield</span>
                </div>
                <p className="text-3xl font-bold text-primary-700 mb-1">
                  {formatNumber(prediction.predictedYield, 2)}
                </p>
                <p className="text-xs text-primary-600/70">tons per hectare (t/ha)</p>
              </div>

              <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2 text-blue-700">
                  <Scale size={18} />
                  <span className="text-sm font-medium">Total Production</span>
                </div>
                <p className="text-3xl font-bold text-blue-700 mb-1">
                  {formatProduction(production)}
                </p>
                <p className="text-xs text-blue-600/70">metric tons (area: {formatNumber(area, 1)} ha)</p>
              </div>
            </div>

            {/* Input summary chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { Icon: Sprout, label: 'Crop', value: prediction.crop },
                { Icon: Calendar, label: 'Season', value: prediction.season || '—' },
                { Icon: MapPin, label: 'Location', value: formatLocation(prediction.location) },
                { Icon: TrendingUp, label: 'Area', value: `${formatNumber(area, 1)} ha` },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="p-4 rounded-lg bg-earth-50">
                  <div className="flex items-center gap-1.5 text-earth-500 text-xs mb-1.5">
                    <Icon size={12} />
                    {label}
                  </div>
                  <p className="font-semibold text-earth-800 text-sm truncate">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Model performance */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-earth-50 to-white border border-earth-100">
            <div className="flex items-center gap-2 mb-5">
              <Gauge size={20} className="text-earth-600" />
              <h3 className="font-semibold text-earth-800">Model Performance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-earth-600">R² Score</span>
                  <span className="font-semibold text-earth-800">{formatNumber(r2, 4)}</span>
                </div>
                <div className="w-full bg-earth-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, r2 * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-earth-400 mt-1">
                  Proportion of yield variance explained
                </p>
              </div>

              <div className="pt-3 border-t border-earth-200 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-earth-500 mb-1">MAE (t/ha)</p>
                  <p className="font-semibold text-earth-800 text-sm">{formatNumber(metrics.mae, 4)}</p>
                </div>
                <div>
                  <p className="text-xs text-earth-500 mb-1">RMSE (t/ha)</p>
                  <p className="font-semibold text-earth-800 text-sm">{formatNumber(metrics.rmse, 4)}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-earth-200">
                <p className="text-xs text-earth-500 mb-1">Generated</p>
                <p className="font-medium text-earth-700 text-sm">{formatDate(prediction.createdAt)}</p>
              </div>

              <div className="pt-2 border-t border-earth-200">
                <p className="text-xs text-earth-400 leading-relaxed">
                  <strong>Note:</strong> R² = 1 indicates a perfect fit to training data.
                  This model was trained on a synthetic agricultural dataset.
                  Use predictions as estimates alongside local expertise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feature Importance */}
      {featureImportance && featureImportance.length > 0 && (
        <FeatureImportance data={featureImportance} />
      )}

      {/* Agricultural Planning Estimates */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <BarChart3 size={20} className="text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-earth-800">Agricultural Planning Estimates</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                Planning Estimate
              </span>
            </div>
            <p className="text-sm text-earth-500">
              Derived from predicted production of {formatNumber(production, 2)} metric tons
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
            <div className="flex items-center gap-2 text-primary-700 mb-2">
              <Scale size={16} />
              <span className="text-sm font-medium">Predicted Production</span>
            </div>
            <p className="text-2xl font-bold text-primary-700">{formatNumber(production, 1)}</p>
            <p className="text-xs text-primary-600/70 mt-0.5">metric tons</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Warehouse size={16} />
              <span className="text-sm font-medium">Storage Requirement</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{formatNumber(storageReq, 0)}</p>
            <p className="text-xs text-blue-600/70 mt-0.5">metric tons (incl. 8% buffer)</p>
          </div>

          <div className="p-4 rounded-xl bg-earth-50 border border-earth-100">
            <div className="flex items-center gap-2 text-earth-700 mb-2">
              <Truck size={16} />
              <span className="text-sm font-medium">Transport Loads</span>
            </div>
            <p className="text-2xl font-bold text-earth-700">{loadsNeeded}</p>
            <p className="text-xs text-earth-600/70 mt-0.5">loads (at 25 MT/truck)</p>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-earth-50 border border-earth-100">
          <Info size={14} className="text-earth-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-earth-500 leading-relaxed">
            <strong>Assumptions:</strong> Storage capacity = predicted production × 1.08 (8% handling
            buffer). Transportation = ⌈production ÷ 25⌉ loads (standard 25-metric-ton truck).
            These are planning estimates only — not operational commitments or professional agronomic advice.
          </p>
        </div>
      </Card>

      {/* Insights from backend */}
      {prediction.insights && prediction.insights.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Target size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-earth-800">Agronomic Insights</h3>
              <p className="text-sm text-earth-500">
                Based on your input parameters — not a substitute for local expert advice
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {prediction.insights.map((insight, idx) => {
              const isWarning = insight.type === 'warning';
              const isPositive = insight.type === 'positive';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    isWarning
                      ? 'bg-amber-50 border-amber-100'
                      : isPositive
                      ? 'bg-green-50 border-green-100'
                      : 'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      isWarning ? 'bg-amber-500' : isPositive ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        isWarning ? 'text-amber-600' : isPositive ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {insight.category}
                    </span>
                    <p className={`text-sm mt-0.5 ${
                      isWarning ? 'text-amber-800' : isPositive ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PredictionResult;
