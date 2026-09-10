import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  CalendarDays,
  FlaskConical,
  CloudSun,
  BrainCircuit,
  ClipboardList,
  ArrowRight,
  BarChart2,
  Target,
  Users,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';

const features: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}> = [
  {
    icon: Sprout,
    title: 'Yield Prediction',
    description: 'AI-powered crop yield forecasting using machine learning trained on decades of agricultural data.',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  {
    icon: CalendarDays,
    title: 'Harvest Forecasting',
    description: 'Accurate harvest timelines and production estimates to optimize your supply chain planning.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: FlaskConical,
    title: 'Soil Intelligence',
    description: 'Deep analysis of NPK ratios, pH levels, and soil composition for nutrient optimization.',
    color: 'text-earth-600',
    bgColor: 'bg-earth-50',
  },
  {
    icon: CloudSun,
    title: 'Weather Insights',
    description: 'Integrate real-time and historical weather data for climate-smart farming decisions.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: BrainCircuit,
    title: 'Explainable AI',
    description: 'Full feature importance transparency—understand exactly why our model predicts what it does.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: ClipboardList,
    title: 'Agricultural Planning',
    description: 'Strategic recommendations for crop rotation, season alignment, and resource allocation.',
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-50',
  },
];

const stats = [
  { label: 'Crop Types Supported', value: '7', icon: Sprout },
  { label: 'Seasons Covered', value: '3', icon: CalendarDays },
  { label: 'AI Model', value: 'GBM', icon: BrainCircuit },
  { label: 'Training Data Points', value: '5000+', icon: BarChart2 },
];

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-8 lg:py-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-green via-primary-700 to-primary-500 mb-16 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative px-6 lg:px-12 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
                <Leaf size={14} />
                AI-Powered Agriculture Intelligence
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.05]">
                Grow Smarter.<br />
                <span className="text-secondary-300">Harvest Better.</span>
              </h1>
              <p className="text-lg text-green-100 mb-8 max-w-lg leading-relaxed">
                HarvestPredict combines machine learning with decades of agricultural data to deliver
                hyper-accurate yield forecasts, harvest timelines, and data-driven farming recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={isAuthenticated ? '/predict' : '/register'}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-primary-700 hover:bg-green-50 shadow-lg hover:shadow-xl"
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Predict Yield Now
                  </Button>
                </Link>
                <Link to={isAuthenticated ? '/dashboard' : '/login'}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                    rightIcon={<ChevronRight size={18} />}
                  >
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="lg:border-l border-white/20 lg:pl-4 first:border-l-0 first:pl-0">
                      <div className="flex items-center gap-2 text-white/70 mb-1">
                        <Icon size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                      </div>
                      <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary-400 rounded-2xl rotate-12 opacity-60" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-300 rounded-xl -rotate-12 opacity-50" />
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="bg-white rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-xs text-earth-500 font-medium uppercase tracking-wide">Sample Prediction</p>
                      <h3 className="text-lg font-bold text-earth-800 mt-1">Winter Wheat 2025</h3>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">92% Confidence</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="p-4 rounded-xl bg-primary-50">
                      <p className="text-xs text-primary-600 mb-1">Predicted Yield</p>
                      <p className="text-2xl font-bold text-primary-700">5,240</p>
                      <p className="text-xs text-primary-600/70">kg / hectare</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50">
                      <p className="text-xs text-blue-600 mb-1">Total Production</p>
                      <p className="text-2xl font-bold text-blue-700">1,310</p>
                      <p className="text-xs text-blue-600/70">metric tons</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-earth-600 mb-2">Feature Impact</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Rainfall', value: 85, color: 'bg-blue-500' },
                        { label: 'Temperature', value: 62, color: 'bg-amber-500' },
                        { label: 'Soil Nitrogen', value: 78, color: 'bg-green-500' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-earth-600">{item.label}</span>
                            <span className="font-semibold text-earth-700">{item.value}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-earth-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-earth-800 mb-4 tracking-tight">
              Everything you need for smarter farming
            </h2>
            <p className="text-lg text-earth-500 max-w-2xl mx-auto">
              Six powerful AI-driven features designed to maximize your agricultural output
              while minimizing risk and resource waste.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} padding="lg" hover>
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-5`}>
                    <Icon size={24} className={feature.color} />
                  </div>
                  <h3 className="text-lg font-bold text-earth-800 mb-2">{feature.title}</h3>
                  <p className="text-earth-600 leading-relaxed text-sm">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <Card padding="none" className="overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12 bg-gradient-to-br from-primary-50 to-cream">
                <h2 className="text-2xl lg:text-3xl font-bold text-earth-800 mb-4 tracking-tight">
                  Ready to transform your harvests?
                </h2>
                <p className="text-earth-600 mb-8 max-w-md">
                  Join thousands of farmers and agricultural businesses already using HarvestPredict
                  to make data-driven decisions that increase yield and reduce waste.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/register">
                    <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                      Create Free Account
                    </Button>
                  </Link>
                  <Link to="/predict">
                    <Button variant="outline" size="lg">
                      Try Demo Prediction
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-8 lg:p-12 bg-gradient-to-br from-dark-green to-primary-700 text-white flex items-center">
                <div>
                  <h3 className="text-xl font-bold mb-6">Why HarvestPredict?</h3>
                  <ul className="space-y-4">
                    {[
                      'ML models trained on diverse agricultural parameters',
                      'High-performance Gradient Boosting predictions',
                      'No setup required—predict in seconds',
                      'Full transparency with feature importance breakdowns',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                          <ChevronRight size={12} className="text-secondary-300" />
                        </div>
                        <span className="text-green-50 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </section>
    </div>
  );
};

export default Home;
