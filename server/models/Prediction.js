const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  location: {
    state: String,
    district: String
  },
  area_hectares: {
    type: Number,
    required: true
  },
  rainfall_mm: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  nitrogen: {
    type: Number,
    required: true
  },
  phosphorus: {
    type: Number,
    required: true
  },
  potassium: {
    type: Number,
    required: true
  },
  ph: {
    type: Number,
    required: true
  },
  season: String,
  irrigation: Boolean,
  fertilizer_used: Boolean,
  predictedYield: {
    type: Number,
    required: true
  },
  predictedProduction: {
    type: Number,
    required: true
  },
  modelVersion: String,
  modelMetrics: {
    r2: Number,
    rmse: Number,
    mae: Number
  },
  featureImportance: Object,
  insights: [{
    type: Object
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', predictionSchema);
