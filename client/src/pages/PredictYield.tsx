import React, { useState } from 'react';
import { ProtectedLayout } from '@/components/Layout';
import PredictionForm from '@/components/PredictionForm';
import PredictionResult from '@/components/PredictionResult';
import LoadingState from '@/components/LoadingState';
import { InlineError } from '@/components/ErrorState';
import { usePredictions } from '@/hooks/usePredictions';
import type { PredictionFormInput, PredictionResponse } from '@/types';

const PredictYield: React.FC = () => {
  const {
    currentPrediction,
    currentMetrics,
    currentFeatureImportance,
    isLoading,
    error,
    createPrediction,
    clearCurrentPrediction,
  } = usePredictions();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: PredictionFormInput) => {
    setSubmitError(null);
    clearCurrentPrediction();
    try {
      await createPrediction(data);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to generate prediction. Please try again.');
    }
  };

  const displayError = submitError || error;

  // Build feature importance list from currentFeatureImportance or prediction's featureImportance
  const featureImportanceItems = (() => {
    if (currentFeatureImportance && currentFeatureImportance.length > 0) {
      return currentFeatureImportance;
    }
    if (currentPrediction?.featureImportance) {
      const fi = currentPrediction.featureImportance;
      if (Array.isArray(fi)) return fi;
      return Object.entries(fi as Record<string, number>)
        .map(([feature, importance]) => ({ feature, importance }))
        .sort((a, b) => b.importance - a.importance);
    }
    return [];
  })();

  const metricsToShow = currentMetrics || currentPrediction?.modelMetrics || null;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-earth-800 tracking-tight mb-1.5">
            Predict Crop Yield
          </h1>
          <p className="text-earth-500">
            Enter your agricultural parameters to receive an AI-powered yield forecast from our
            trained GradientBoosting model.
          </p>
        </div>

        {displayError && <InlineError message={displayError} />}

        {isLoading ? (
          <LoadingState
            message="Running ML model analysis..."
            fullHeight
          />
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-3">
              {currentPrediction && metricsToShow ? (
                <PredictionResult
                  prediction={currentPrediction}
                  metrics={metricsToShow}
                  featureImportance={featureImportanceItems}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-10 rounded-2xl bg-white border border-dashed border-earth-200 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#15803d"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a10 10 0 1 0 10 10" />
                        <path d="M12 8v4l3 3" />
                        <path d="M20 2v6h-6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-earth-800 mb-2">
                      No prediction yet
                    </h3>
                    <p className="text-sm text-earth-500">
                      Fill in the agricultural parameters on the left and click{' '}
                      <strong>"Predict Crop Yield"</strong> to see your AI-powered results here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default PredictYield;
