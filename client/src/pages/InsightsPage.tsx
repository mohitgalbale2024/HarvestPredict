import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sprout,
  Droplets,
  ThermometerSun,
  FlaskConical,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  ArrowRight,
  BrainCircuit,
  Info,
} from 'lucide-react';
import { ProtectedLayout } from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LoadingState from '@/components/LoadingState';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '@/services/dashboardService';
import type { InsightItem, Prediction } from '@/types';
import { formatDate } from '@/utils/formatters';

const InsightsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const stats = await getDashboardStats();
        if (stats.latestPrediction && stats.latestPrediction.insights) {
          setInsights(stats.latestPrediction.insights);
          setLatestPrediction(stats.latestPrediction);
        }
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const getInsightIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('water') || cat.includes('rain') || cat.includes('humidity')) return Droplets;
    if (cat.includes('temperature') || cat.includes('climate')) return ThermometerSun;
    if (cat.includes('soil') || cat.includes('nutrient') || cat.includes('nitrogen') || cat.includes('ph')) return FlaskConical;
    if (cat.includes('yield') || cat.includes('growth')) return TrendingUp;
    if (cat.includes('time') || cat.includes('season')) return CalendarClock;
    return Lightbulb;
  };

  const getInsightColor = (type: string) => {
    if (type === 'warning') return 'text-amber-600 bg-amber-50 border-amber-200';
    if (type === 'positive') return 'text-green-600 bg-green-50 border-green-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-earth-800 tracking-tight mb-1.5">
            Agronomic Insights
          </h1>
          <p className="text-earth-500">
            AI-generated recommendations and warnings based on your latest prediction parameters.
          </p>
        </div>

        {isLoading ? (
          <LoadingState message="Analyzing your latest prediction data..." />
        ) : latestPrediction ? (
          <div className="space-y-6">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-earth-50 border border-earth-100 mb-6">
              <Info size={16} className="text-earth-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-earth-600">
                These insights are generated from your most recent prediction for <strong>{latestPrediction.crop}</strong> in <strong>{latestPrediction.season}</strong> (made on {formatDate(latestPrediction.createdAt)}). They highlight parameters that are suboptimal or optimal compared to the ideal ranges for this crop.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {insights.length > 0 ? (
                insights.map((insight, idx) => {
                  const Icon = getInsightIcon(insight.category);
                  const colorClass = getInsightColor(insight.type);
                  
                  return (
                    <Card key={idx} padding="lg" className={`border ${colorClass.split(' ')[2]}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass.split(' ')[1]}`}>
                          <Icon size={24} className={colorClass.split(' ')[0]} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider ${colorClass.split(' ')[0]}`}>
                              {insight.category}
                            </span>
                            {insight.severity === 'high' && (
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                                High Priority
                              </span>
                            )}
                          </div>
                          <p className="text-earth-700 leading-relaxed text-sm">
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-2 text-center p-12 bg-white rounded-2xl border border-dashed border-earth-200">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-earth-800 mb-2">All Parameters Optimal</h3>
                  <p className="text-earth-500 max-w-md mx-auto">
                    Your latest prediction parameters fall within the ideal ranges for the selected crop. We don't have any specific warnings or improvement recommendations at this time.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-8">
              <Link to="/predict">
                <Button variant="primary" rightIcon={<ArrowRight size={18} />}>
                  Run New Prediction
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-earth-200">
            <div className="w-16 h-16 rounded-2xl bg-earth-100 flex items-center justify-center mx-auto mb-4">
              <Lightbulb size={32} className="text-earth-400" />
            </div>
            <h3 className="text-lg font-bold text-earth-800 mb-2">No Insights Available</h3>
            <p className="text-earth-500 max-w-md mx-auto mb-6">
              We generate agronomic insights based on your prediction data. Run a yield prediction to get personalized recommendations for your crop.
            </p>
            <Link to="/predict">
              <Button variant="primary" rightIcon={<ArrowRight size={18} />}>
                Start Your First Prediction
              </Button>
            </Link>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default InsightsPage;
