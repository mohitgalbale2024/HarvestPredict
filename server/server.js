require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const predictionRoutes = require('./routes/predictions');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 5 : 100,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'harvestpredict-api',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/predictions', apiLimiter, predictionRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'
  });
});

let server;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log('✓ Connected to MongoDB successfully');

    server = app.listen(PORT, () => {
      console.log(`✓ HarvestPredict server running on port ${PORT}`);
      console.log(`✓ Environment: ${NODE_ENV}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
    });

    setupGracefulShutdown();
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

function setupGracefulShutdown() {
  const shutdownSignals = ['SIGTERM', 'SIGINT'];

  shutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      if (server) {
        server.close((err) => {
          if (err) {
            console.error('Error closing HTTP server:', err.message);
          } else {
            console.log('✓ HTTP server closed successfully');
          }
        });
      }

      try {
        await mongoose.connection.close(false);
        console.log('✓ MongoDB connection closed successfully');
      } catch (mongoErr) {
        console.error('Error closing MongoDB connection:', mongoErr.message);
      }

      const shutdownTimeout = setTimeout(() => {
        console.error('Forced shutdown after 10s timeout');
        process.exit(1);
      }, 10000);
      shutdownTimeout.unref();

      mongoose.connection.on('close', () => {
        clearTimeout(shutdownTimeout);
        console.log('✓ Graceful shutdown complete');
        process.exit(0);
      });

      if (mongoose.connection.readyState === 0) {
        clearTimeout(shutdownTimeout);
        console.log('✓ Graceful shutdown complete');
        process.exit(0);
      }
    });
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message, err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

startServer();

module.exports = app;
