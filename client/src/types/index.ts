export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Prediction {
  id: string;
  _id?: string;
  userId: string;
  crop: string;
  season: string;
  location: { state: string; district: string } | string;
  area_hectares: number;
  rainfall_mm: number;
  temperature: number;
  humidity: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  irrigation: boolean;
  fertilizer_used: boolean;
  predictedYield: number;
  predictedProduction: number;
  modelVersion?: string;
  modelMetrics?: ModelMetrics;
  featureImportance?: Record<string, number> | FeatureImportanceItem[];
  insights?: InsightItem[];
  createdAt: string;
}

export interface ModelMetrics {
  r2: number;
  rmse: number;
  mae: number;
}

export interface InsightItem {
  type: 'positive' | 'warning' | 'info';
  category: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface DashboardStats {
  totalPredictions: number;
  mostAnalyzedCrop: string;
  averageYield: number;
  latestPrediction: Prediction | null;
  cropCounts: Record<string, number>;
  soilAverages: Record<string, number>;
  weatherAverages: Record<string, number>;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface PredictionFormInput {
  crop: string;
  season: string;
  location: { state: string; district: string };
  area_hectares: number;
  rainfall_mm: number;
  temperature: number;
  humidity: number;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  irrigation: boolean;
  fertilizer_used: boolean;
}

export interface LoginFormInput {
  email: string;
  password: string;
}

export interface RegisterFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface YieldTrendDataPoint {
  date: string;
  yield: number;
}

export interface CropComparisonDataPoint {
  crop: string;
  yield: number;
}

export interface SeasonalRadarDataPoint {
  season: string;
  value: number;
  fullMark: number;
}

export interface PredictionResponse {
  prediction: Prediction;
  metrics: ModelMetrics;
  featureImportance: Record<string, number> | FeatureImportanceItem[];
  modelVersion?: string;
  insights?: InsightItem[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
