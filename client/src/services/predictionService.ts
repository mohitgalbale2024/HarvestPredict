import api from './api';
import type {
  Prediction,
  PredictionFormInput,
  PredictionResponse,
  FeatureImportanceItem,
  ModelMetrics,
  InsightItem,
} from '@/types';

/**
 * Normalise the raw server response into the frontend PredictionResponse shape.
 * The Express backend stores and returns camelCase fields that mirror the
 * FastAPI ML service's snake_case response via its own mapping.
 */
function mapServerPrediction(raw: any): Prediction {
  return {
    id: raw._id || raw.id || '',
    _id: raw._id,
    userId: raw.userId || '',
    crop: raw.crop,
    season: raw.season || '',
    location: raw.location || { state: '', district: '' },
    area_hectares: raw.area_hectares,
    rainfall_mm: raw.rainfall_mm,
    temperature: raw.temperature,
    humidity: raw.humidity,
    ph: raw.ph,
    nitrogen: raw.nitrogen,
    phosphorus: raw.phosphorus,
    potassium: raw.potassium,
    irrigation: raw.irrigation ?? false,
    fertilizer_used: raw.fertilizer_used ?? false,
    predictedYield: raw.predictedYield,
    predictedProduction: raw.predictedProduction,
    modelVersion: raw.modelVersion,
    modelMetrics: raw.modelMetrics || null,
    featureImportance: raw.featureImportance || null,
    insights: raw.insights || [],
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function mapFeatureImportance(fi: any): FeatureImportanceItem[] {
  if (!fi) return [];
  if (Array.isArray(fi)) return fi as FeatureImportanceItem[];
  // fi is a plain object { feature: importance }
  return Object.entries(fi)
    .map(([feature, importance]) => ({ feature, importance: importance as number }))
    .sort((a, b) => b.importance - a.importance);
}

export const createPrediction = async (data: PredictionFormInput): Promise<PredictionResponse> => {
  try {
    const response = await api.post<{
      prediction: any;
      metrics: ModelMetrics;
      featureImportance: Record<string, number>;
      modelVersion?: string;
      insights?: InsightItem[];
    }>('/predictions', data);

    const raw = response.data;
    const prediction = mapServerPrediction(raw.prediction);
    const featureImportance = mapFeatureImportance(raw.featureImportance);

    return {
      prediction,
      metrics: raw.metrics || prediction.modelMetrics || { r2: 0, rmse: 0, mae: 0 },
      featureImportance,
      modelVersion: raw.modelVersion,
      insights: raw.insights || [],
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create prediction. Please try again.');
  }
};

export const getPredictions = async (): Promise<Prediction[]> => {
  try {
    const response = await api.get<{ predictions: any[] }>('/predictions');
    return (response.data.predictions || []).map(mapServerPrediction);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch predictions.');
  }
};

export const getPredictionById = async (id: string): Promise<Prediction> => {
  try {
    const response = await api.get<{ prediction: any }>(`/predictions/${id}`);
    return mapServerPrediction(response.data.prediction);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch prediction.');
  }
};

export const deletePrediction = async (id: string): Promise<void> => {
  try {
    await api.delete(`/predictions/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete prediction.');
  }
};

export const getCropOptions = (): string[] => [
  'Cotton',
  'Soybean',
  'Wheat',
  'Rice',
  'Maize',
  'Sugarcane',
  'Turmeric',
];

export const getSeasonOptions = (): string[] => ['Kharif', 'Rabi', 'Summer'];

export const getLocationOptions = (): Array<{ state: string; district: string }> => [
  { district: 'Amravati', state: 'Maharashtra' },
  { district: 'Pune', state: 'Maharashtra' },
  { district: 'Nagpur', state: 'Maharashtra' },
  { district: 'Nashik', state: 'Maharashtra' },
  { district: 'Aurangabad', state: 'Maharashtra' },
  { district: 'Ludhiana', state: 'Punjab' },
  { district: 'Kanpur', state: 'Uttar Pradesh' },
  { district: 'Mysuru', state: 'Karnataka' },
  { district: 'Ahmedabad', state: 'Gujarat' },
];
