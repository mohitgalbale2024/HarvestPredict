const express = require('express');
const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/overview
router.get('/overview', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const totalPredictions = await Prediction.countDocuments({ userId });

    const latestPrediction = await Prediction.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const statsAgg = await Prediction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          avgYield: { $avg: '$predictedYield' },
          avgRainfall: { $avg: '$rainfall_mm' },
          avgTemperature: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          avgNitrogen: { $avg: '$nitrogen' },
          avgPhosphorus: { $avg: '$phosphorus' },
          avgPotassium: { $avg: '$potassium' },
          avgPh: { $avg: '$ph' },
          totalArea: { $sum: '$area_hectares' },
          totalProduction: { $sum: '$predictedProduction' }
        }
      }
    ]);

    const stats = statsAgg.length > 0 ? statsAgg[0] : {};

    const cropCounts = await Prediction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$crop',
          count: { $sum: 1 },
          avgYield: { $avg: '$predictedYield' },
          totalArea: { $sum: '$area_hectares' },
          totalProduction: { $sum: '$predictedProduction' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const countsByCrop = {};
    let mostCommonCrop = null;
    cropCounts.forEach((item, index) => {
      countsByCrop[item._id] = {
        count: item.count,
        avgYield: Number(item.avgYield.toFixed(4)),
        totalArea: Number(item.totalArea.toFixed(2)),
        totalProduction: Number(item.totalProduction.toFixed(2))
      };
      if (index === 0) {
        mostCommonCrop = item._id;
      }
    });

    const recentPredictions = await Prediction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      overview: {
        predictionStats: {
          totalPredictions,
          mostCommonCrop,
          avgYield: stats.avgYield ? Number(stats.avgYield.toFixed(4)) : 0,
          totalArea: stats.totalArea ? Number(stats.totalArea.toFixed(2)) : 0,
          totalProduction: stats.totalProduction ? Number(stats.totalProduction.toFixed(2)) : 0,
          countsByCrop,
          latestPrediction
        },
        soilAverages: {
          avgNitrogen: stats.avgNitrogen ? Number(stats.avgNitrogen.toFixed(2)) : 0,
          avgPhosphorus: stats.avgPhosphorus ? Number(stats.avgPhosphorus.toFixed(2)) : 0,
          avgPotassium: stats.avgPotassium ? Number(stats.avgPotassium.toFixed(2)) : 0,
          avgPh: stats.avgPh ? Number(stats.avgPh.toFixed(2)) : 0
        },
        weatherAverages: {
          avgRainfall: stats.avgRainfall ? Number(stats.avgRainfall.toFixed(2)) : 0,
          avgTemperature: stats.avgTemperature ? Number(stats.avgTemperature.toFixed(2)) : 0,
          avgHumidity: stats.avgHumidity ? Number(stats.avgHumidity.toFixed(2)) : 0
        },
        recentPredictions
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching dashboard overview'
    });
  }
});

// GET /api/dashboard/yield-trend
// Returns monthly average yield from the user's prediction history
router.get('/yield-trend', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const trendData = await Prediction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          avgYield: { $avg: '$predictedYield' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = trendData.map((item) => ({
      date: `${MONTH_NAMES[item._id.month - 1]} ${item._id.year}`,
      yield: Number(item.avgYield.toFixed(4)),
      count: item.count
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Yield trend error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching yield trend'
    });
  }
});

// GET /api/dashboard/crop-comparison
// Returns average yield per crop from the user's prediction history
router.get('/crop-comparison', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const cropData = await Prediction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$crop',
          avgYield: { $avg: '$predictedYield' },
          totalProduction: { $sum: '$predictedProduction' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgYield: -1 } }
    ]);

    const data = cropData.map((item) => ({
      crop: item._id,
      yield: Number(item.avgYield.toFixed(4)),
      totalProduction: Number(item.totalProduction.toFixed(2)),
      count: item.count
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Crop comparison error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching crop comparison'
    });
  }
});

// GET /api/dashboard/seasonal-radar
// Returns average yield score per season (0–100 normalised relative to max)
router.get('/seasonal-radar', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const seasonData = await Prediction.aggregate([
      { $match: { userId, season: { $ne: null, $ne: '' } } },
      {
        $group: {
          _id: '$season',
          avgYield: { $avg: '$predictedYield' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (seasonData.length === 0) {
      return res.status(200).json({
        success: true,
        data: [
          { season: 'Kharif', value: 0, fullMark: 100 },
          { season: 'Rabi', value: 0, fullMark: 100 },
          { season: 'Summer', value: 0, fullMark: 100 }
        ]
      });
    }

    const maxYield = Math.max(...seasonData.map((s) => s.avgYield));

    const seasonMap = {};
    seasonData.forEach((item) => {
      seasonMap[item._id] = {
        value: maxYield > 0 ? Math.round((item.avgYield / maxYield) * 100) : 0,
        fullMark: 100
      };
    });

    // Ensure all canonical seasons appear
    const SEASONS = ['Kharif', 'Rabi', 'Summer'];
    const data = SEASONS.map((season) => ({
      season,
      value: seasonMap[season] ? seasonMap[season].value : 0,
      fullMark: 100
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Seasonal radar error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching seasonal radar'
    });
  }
});

module.exports = router;
