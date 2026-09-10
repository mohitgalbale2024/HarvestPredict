const CROP_TEMPERATURE_RANGES = {
  Cotton: { min: 20, max: 35 },
  Wheat: { min: 15, max: 25 },
  Rice: { min: 20, max: 35 },
  Soybean: { min: 20, max: 30 },
  Maize: { min: 18, max: 32 },
  Sugarcane: { min: 20, max: 38 },
  Turmeric: { min: 20, max: 35 }
};

function generateInsights(predictionInput, predictionResult) {
  const insights = [];
  const {
    crop,
    rainfall_mm,
    temperature,
    ph,
    nitrogen,
    phosphorus,
    potassium,
    humidity,
    area_hectares,
    irrigation,
    fertilizer_used
  } = predictionInput;

  const {
    predictedYield,
    predictedProduction
  } = predictionResult;

  if (rainfall_mm < 500) {
    insights.push({
      type: 'warning',
      category: 'rainfall',
      message: `Low rainfall (${rainfall_mm}mm) detected. Consider supplementary irrigation to support ${crop} growth.`,
      severity: 'high'
    });
  } else if (rainfall_mm > 1200) {
    insights.push({
      type: 'warning',
      category: 'rainfall',
      message: `High rainfall (${rainfall_mm}mm) expected. Ensure proper drainage systems to prevent waterlogging and root rot in ${crop}.`,
      severity: 'high'
    });
  } else if (rainfall_mm >= 600 && rainfall_mm <= 1000) {
    insights.push({
      type: 'positive',
      category: 'rainfall',
      message: `Rainfall (${rainfall_mm}mm) is within optimal range for ${crop} cultivation.`,
      severity: 'low'
    });
  }

  const tempRange = CROP_TEMPERATURE_RANGES[crop];
  if (tempRange) {
    if (temperature < tempRange.min) {
      insights.push({
        type: 'warning',
        category: 'temperature',
        message: `Temperature (${temperature}°C) is below the optimal range (${tempRange.min}-${tempRange.max}°C) for ${crop}. This may slow down growth and reduce yield.`,
        severity: 'medium'
      });
    } else if (temperature > tempRange.max) {
      insights.push({
        type: 'warning',
        category: 'temperature',
        message: `Temperature (${temperature}°C) is above the optimal range (${tempRange.min}-${tempRange.max}°C) for ${crop}. Heat stress may affect pollination and grain filling.`,
        severity: 'medium'
      });
    } else {
      insights.push({
        type: 'positive',
        category: 'temperature',
        message: `Temperature (${temperature}°C) is within the optimal range (${tempRange.min}-${tempRange.max}°C) for ${crop}.`,
        severity: 'low'
      });
    }
  }

  if (ph < 5.5) {
    insights.push({
      type: 'warning',
      category: 'soil',
      message: `Soil pH (${ph}) is too acidic. Consider applying lime to raise pH toward the ideal range of 6.0-7.5.`,
      severity: 'medium'
    });
  } else if (ph > 8.0) {
    insights.push({
      type: 'warning',
      category: 'soil',
      message: `Soil pH (${ph}) is too alkaline. Consider applying sulfur or organic matter to lower pH toward the ideal range of 6.0-7.5.`,
      severity: 'medium'
    });
  } else if (ph >= 6.0 && ph <= 7.5) {
    insights.push({
      type: 'positive',
      category: 'soil',
      message: `Soil pH (${ph}) is within the ideal range (6.0-7.5) for nutrient availability.`,
      severity: 'low'
    });
  }

  if (nitrogen < 100) {
    insights.push({
      type: 'warning',
      category: 'nutrients',
      message: `Nitrogen level (${nitrogen} kg/ha) is low. ${crop} may show stunted growth and yellowing leaves. Consider applying urea or compost.`,
      severity: 'high'
    });
  } else if (nitrogen > 250) {
    insights.push({
      type: 'warning',
      category: 'nutrients',
      message: `Nitrogen level (${nitrogen} kg/ha) is very high. Excessive N can cause lodging, delayed maturity, and pest susceptibility in ${crop}.`,
      severity: 'medium'
    });
  } else if (nitrogen >= 120 && nitrogen <= 200) {
    insights.push({
      type: 'positive',
      category: 'nutrients',
      message: `Nitrogen level (${nitrogen} kg/ha) is adequate for ${crop} growth.`,
      severity: 'low'
    });
  }

  if (phosphorus < 15) {
    insights.push({
      type: 'warning',
      category: 'nutrients',
      message: `Phosphorus level (${phosphorus} kg/ha) is low. This can restrict root development and flowering in ${crop}. Apply single super phosphate or DAP.`,
      severity: 'high'
    });
  } else if (phosphorus >= 20 && phosphorus <= 50) {
    insights.push({
      type: 'positive',
      category: 'nutrients',
      message: `Phosphorus level (${phosphorus} kg/ha) is sufficient for ${crop}.`,
      severity: 'low'
    });
  }

  if (potassium < 150) {
    insights.push({
      type: 'warning',
      category: 'nutrients',
      message: `Potassium level (${potassium} kg/ha) is low. ${crop} may have reduced disease resistance and lodging risk. Apply muriate of potash.`,
      severity: 'medium'
    });
  } else if (potassium >= 180 && potassium <= 280) {
    insights.push({
      type: 'positive',
      category: 'nutrients',
      message: `Potassium level (${potassium} kg/ha) is well-balanced for ${crop} stress tolerance.`,
      severity: 'low'
    });
  }

  if (humidity !== undefined && humidity >= 60 && humidity <= 80) {
    insights.push({
      type: 'positive',
      category: 'humidity',
      message: `Humidity (${humidity}%) is favorable for ${crop} growth.`,
      severity: 'low'
    });
  } else if (humidity !== undefined && humidity > 85) {
    insights.push({
      type: 'warning',
      category: 'humidity',
      message: `High humidity (${humidity}%) may increase fungal disease risk in ${crop}. Monitor for powdery mildew and leaf blight.`,
      severity: 'medium'
    });
  }

  if (irrigation) {
    insights.push({
      type: 'positive',
      category: 'management',
      message: 'Irrigation facilities available. This helps mitigate rainfall variability risks.',
      severity: 'low'
    });
  }

  if (fertilizer_used) {
    insights.push({
      type: 'info',
      category: 'management',
      message: 'Fertilizer application recorded. Consider balanced NPK timing based on crop growth stages.',
      severity: 'low'
    });
  }

  if (predictedYield !== undefined && area_hectares !== undefined) {
    insights.push({
      type: 'info',
      category: 'prediction',
      message: `Predicted yield of ${predictedYield.toFixed(2)} units/ha across ${area_hectares} hectares gives an estimated total production of ${predictedProduction.toFixed(2)} units.`,
      severity: 'low'
    });
  }

  return insights;
}

module.exports = { generateInsights, CROP_TEMPERATURE_RANGES };
