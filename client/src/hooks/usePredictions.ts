import { useState, useCallback } from 'react';
import type { Prediction, PredictionFormInput, PredictionResponse, FeatureImportanceItem } from '@/types';
import {
  createPrediction as createPredictionService,
  getPredictions as getPredictionsService,
  getPredictionById as getPredictionByIdService,
  deletePrediction as deletePredictionService,
} from '@/services/predictionService';
import { useAuth } from '@/hooks/useAuth';

/** Compute a prediction locally — mirrors the server's fallback logic */
function computeGuestPrediction(data: PredictionFormInput): PredictionResponse {
  const baseYieldByCrop: Record<string, number> = {
    Cotton: 2.5, Wheat: 3.5, Rice: 4.0, Soybean: 2.8,
    Maize: 5.0, Sugarcane: 70.0, Turmeric: 12.0,
  };
  const baseYield = baseYieldByCrop[data.crop] ?? 3.0;
  const factor =
    (data.rainfall_mm / 800) *
    (data.nitrogen / 150) *
    (data.phosphorus / 30) *
    (data.potassium / 200);
  const adjustedYield = baseYield * Math.min(Math.max(factor, 0.3), 1.8);
  const predictedYield = Number(adjustedYield.toFixed(2));
  const predictedProduction = Number((adjustedYield * data.area_hectares).toFixed(2));

  const featureImportance: FeatureImportanceItem[] = [
    { feature: 'rainfall_mm', importance: 0.22 },
    { feature: 'nitrogen', importance: 0.18 },
    { feature: 'temperature', importance: 0.15 },
    { feature: 'ph', importance: 0.12 },
    { feature: 'phosphorus', importance: 0.11 },
    { feature: 'potassium', importance: 0.10 },
    { feature: 'humidity', importance: 0.07 },
    { feature: 'area_hectares', importance: 0.05 },
  ];

  const prediction: Prediction = {
    id: `guest-${Date.now()}`,
    _id: `guest-${Date.now()}`,
    userId: 'guest-demo-user',
    crop: data.crop,
    season: data.season,
    location: data.location,
    area_hectares: data.area_hectares,
    rainfall_mm: data.rainfall_mm,
    temperature: data.temperature,
    humidity: data.humidity,
    ph: data.ph,
    nitrogen: data.nitrogen,
    phosphorus: data.phosphorus,
    potassium: data.potassium,
    irrigation: data.irrigation,
    fertilizer_used: data.fertilizer_used,
    predictedYield,
    predictedProduction,
    modelVersion: 'guest-fallback-v1.0',
    modelMetrics: { r2: 0.78, rmse: 0.45, mae: 0.32 },
    featureImportance,
    insights: [],
    createdAt: new Date().toISOString(),
  };

  return {
    prediction,
    metrics: { r2: 0.78, rmse: 0.45, mae: 0.32 },
    featureImportance,
    modelVersion: 'guest-fallback-v1.0',
    insights: [],
  };
}

export const usePredictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [currentFeatureImportance, setCurrentFeatureImportance] = useState<FeatureImportanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isGuest } = useAuth();

  const createPrediction = useCallback(async (data: PredictionFormInput): Promise<PredictionResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      // Guest users: compute locally, never hit the backend
      if (isGuest) {
        await new Promise((r) => setTimeout(r, 800)); // brief loading feel
        const response = computeGuestPrediction(data);
        setCurrentPrediction(response.prediction);
        setCurrentMetrics(response.metrics);
        setCurrentFeatureImportance(response.featureImportance as FeatureImportanceItem[]);
        setPredictions((prev) => [response.prediction, ...prev]);
        return response;
      }

      const response = await createPredictionService(data);
      setCurrentPrediction(response.prediction);
      setCurrentMetrics(response.metrics);
      const fi = response.featureImportance;
      const normalizedFi: FeatureImportanceItem[] = Array.isArray(fi)
        ? fi
        : Object.entries(fi as Record<string, number>)
            .map(([feature, importance]) => ({ feature, importance }))
            .sort((a, b) => b.importance - a.importance);
      setCurrentFeatureImportance(normalizedFi);
      setPredictions((prev) => [response.prediction, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPredictionsService();
      setPredictions(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPredictionById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPredictionByIdService(id);
      setCurrentPrediction(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removePrediction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deletePredictionService(id);
      setPredictions((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCurrentPrediction = useCallback(() => {
    setCurrentPrediction(null);
    setCurrentMetrics(null);
    setCurrentFeatureImportance([]);
  }, []);

  return {
    predictions,
    currentPrediction,
    currentMetrics,
    currentFeatureImportance,
    isLoading,
    error,
    createPrediction,
    fetchPredictions,
    fetchPredictionById,
    removePrediction,
    clearCurrentPrediction,
  };
};
