import React, { useState, type FormEvent } from 'react';
import { Sprout, CloudRain, Thermometer, Droplets, FlaskConical, Tractor, Leaf } from 'lucide-react';
import type { PredictionFormInput } from '@/types';
import { getCropOptions, getSeasonOptions, getLocationOptions } from '@/services/predictionService';
import { validateSelectField, validateNumberField } from '@/utils/validators';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import Card from './Card';

interface PredictionFormProps {
  onSubmit: (data: PredictionFormInput) => void;
  isLoading?: boolean;
}

type FormErrors = Partial<Record<keyof PredictionFormInput, string>> & {
  location?: string;
};

const initialFormData: PredictionFormInput = {
  crop: '',
  season: '',
  location: { state: '', district: '' },
  area_hectares: 0,
  rainfall_mm: 0,
  temperature: 0,
  humidity: 0,
  ph: 0,
  nitrogen: 0,
  phosphorus: 0,
  potassium: 0,
  irrigation: false,
  fertilizer_used: false,
};

const PredictionForm: React.FC<PredictionFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PredictionFormInput>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const cropOptions = getCropOptions().map((c) => ({ value: c, label: c }));
  const seasonOptions = getSeasonOptions().map((s) => ({ value: s, label: s }));
  const locationOptions = getLocationOptions().map((l) => ({
    value: `${l.district},${l.state}`,
    label: `${l.district}, ${l.state}`,
  }));

  const handleChange = <K extends keyof PredictionFormInput>(
    field: K,
    value: PredictionFormInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if ((errors as any)[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete (next as any)[field];
        return next;
      });
    }
  };

  const handleLocationChange = (raw: string) => {
    const [district, ...stateParts] = raw.split(',');
    const state = stateParts.join(',').trim();
    handleChange('location', { district: district.trim(), state });
  };

  const getLocationValue = () => {
    const loc = formData.location;
    if (!loc || (!loc.district && !loc.state)) return '';
    return `${loc.district},${loc.state}`;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const cropError = validateSelectField(formData.crop, 'a crop');
    if (cropError) newErrors.crop = cropError;

    const seasonError = validateSelectField(formData.season, 'a season');
    if (seasonError) newErrors.season = seasonError;

    const loc = formData.location;
    if (!loc || !loc.district) newErrors.location = 'Please select a location';

    const areaError = validateNumberField(formData.area_hectares, 'Area', { min: 0.1, max: 100000 });
    if (areaError) newErrors.area_hectares = areaError;

    const rainfallError = validateNumberField(formData.rainfall_mm, 'Rainfall', { min: 0, max: 10000 });
    if (rainfallError) newErrors.rainfall_mm = rainfallError;

    const tempError = validateNumberField(formData.temperature, 'Temperature', { min: 0, max: 60 });
    if (tempError) newErrors.temperature = tempError;

    const humidityError = validateNumberField(formData.humidity, 'Humidity', { min: 0, max: 100 });
    if (humidityError) newErrors.humidity = humidityError;

    const phError = validateNumberField(formData.ph, 'pH', { min: 0, max: 14 });
    if (phError) newErrors.ph = phError;

    const nitrogenError = validateNumberField(formData.nitrogen, 'Nitrogen', { min: 0, max: 500 });
    if (nitrogenError) newErrors.nitrogen = nitrogenError;

    const phosphorusError = validateNumberField(formData.phosphorus, 'Phosphorus', { min: 0, max: 500 });
    if (phosphorusError) newErrors.phosphorus = phosphorusError;

    const potassiumError = validateNumberField(formData.potassium, 'Potassium', { min: 0, max: 500 });
    if (potassiumError) newErrors.potassium = potassiumError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card padding="lg">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <Sprout size={20} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-earth-800">Yield Prediction Input</h2>
            <p className="text-sm text-earth-500">Enter agricultural parameters for accurate yield forecasting</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Crop & Location */}
        <div>
          <h3 className="text-sm font-semibold text-earth-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary-500 rounded-full" />
            Crop &amp; Location Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Crop Type"
              name="crop"
              value={formData.crop}
              onChange={(e) => handleChange('crop', e.target.value)}
              options={cropOptions}
              placeholder="Select crop"
              error={errors.crop}
            />
            <Select
              label="Season"
              name="season"
              value={formData.season}
              onChange={(e) => handleChange('season', e.target.value)}
              options={seasonOptions}
              placeholder="Select season"
              error={errors.season}
            />
            <Select
              label="Location"
              name="location"
              value={getLocationValue()}
              onChange={(e) => handleLocationChange(e.target.value)}
              options={locationOptions}
              placeholder="Select location"
              error={errors.location}
            />
          </div>
        </div>

        {/* Area & Weather */}
        <div>
          <h3 className="text-sm font-semibold text-earth-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full" />
            Area &amp; Weather Conditions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Area (hectares)"
              type="number"
              name="area_hectares"
              min={0.1}
              step="0.01"
              value={formData.area_hectares || ''}
              onChange={(e) => handleChange('area_hectares', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 10.5"
              error={errors.area_hectares}
              helperText="Total cultivated land area"
            />
            <Input
              label="Rainfall (mm)"
              type="number"
              name="rainfall_mm"
              min={0}
              step="1"
              value={formData.rainfall_mm || ''}
              onChange={(e) => handleChange('rainfall_mm', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 800"
              leftIcon={<CloudRain size={16} />}
              error={errors.rainfall_mm}
              helperText="Seasonal precipitation"
            />
            <Input
              label="Temperature (°C)"
              type="number"
              name="temperature"
              min={0}
              max={60}
              step="0.1"
              value={formData.temperature || ''}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 28"
              leftIcon={<Thermometer size={16} />}
              error={errors.temperature}
              helperText="Average temperature"
            />
            <Input
              label="Humidity (%)"
              type="number"
              name="humidity"
              min={0}
              max={100}
              step="1"
              value={formData.humidity || ''}
              onChange={(e) => handleChange('humidity', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 70"
              leftIcon={<Droplets size={16} />}
              error={errors.humidity}
              helperText="Relative humidity"
            />
          </div>
        </div>

        {/* Soil Nutrients */}
        <div>
          <h3 className="text-sm font-semibold text-earth-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-500 rounded-full" />
            Soil Nutrients &amp; Chemistry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Soil pH"
              type="number"
              name="ph"
              min={0}
              max={14}
              step="0.1"
              value={formData.ph || ''}
              onChange={(e) => handleChange('ph', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 6.5"
              leftIcon={<FlaskConical size={16} />}
              error={errors.ph}
              helperText="0–14 scale"
            />
            <Input
              label="Nitrogen (N, kg/ha)"
              type="number"
              name="nitrogen"
              min={0}
              step="1"
              value={formData.nitrogen || ''}
              onChange={(e) => handleChange('nitrogen', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 120"
              error={errors.nitrogen}
            />
            <Input
              label="Phosphorus (P, kg/ha)"
              type="number"
              name="phosphorus"
              min={0}
              step="1"
              value={formData.phosphorus || ''}
              onChange={(e) => handleChange('phosphorus', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 30"
              error={errors.phosphorus}
            />
            <Input
              label="Potassium (K, kg/ha)"
              type="number"
              name="potassium"
              min={0}
              step="1"
              value={formData.potassium || ''}
              onChange={(e) => handleChange('potassium', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 200"
              error={errors.potassium}
            />
          </div>
        </div>

        {/* Farm Management */}
        <div>
          <h3 className="text-sm font-semibold text-earth-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-600 rounded-full" />
            Farm Management
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleChange('irrigation', !formData.irrigation)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                formData.irrigation
                  ? 'border-primary-500 bg-primary-50 text-primary-800'
                  : 'border-earth-200 bg-white text-earth-600 hover:border-earth-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                formData.irrigation ? 'bg-primary-500 text-white' : 'bg-earth-100 text-earth-500'
              }`}>
                <Tractor size={20} />
              </div>
              <div>
                <p className="font-semibold">Irrigation Available</p>
                <p className="text-xs opacity-70">Water supply access for the field</p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                formData.irrigation ? 'bg-primary-500 border-primary-500' : 'border-earth-300'
              }`}>
                {formData.irrigation && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleChange('fertilizer_used', !formData.fertilizer_used)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                formData.fertilizer_used
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-earth-200 bg-white text-earth-600 hover:border-earth-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                formData.fertilizer_used ? 'bg-amber-500 text-white' : 'bg-earth-100 text-earth-500'
              }`}>
                <Leaf size={20} />
              </div>
              <div>
                <p className="font-semibold">Fertilizer Applied</p>
                <p className="text-xs opacity-70">Chemical or organic fertilizer used</p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                formData.fertilizer_used ? 'bg-amber-500 border-amber-500' : 'border-earth-300'
              }`}>
                {formData.fertilizer_used && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setFormData(initialFormData);
              setErrors({});
            }}
            className="sm:order-1"
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            fullWidth
            className="sm:order-2 flex-1"
          >
            {isLoading ? 'Analyzing with AI...' : 'Predict Crop Yield'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PredictionForm;
