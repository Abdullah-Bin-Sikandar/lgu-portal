require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

// Trust proxy headers (essential for Vercel, rate limiters, cookies)
app.set('trust proxy', 1);

// Connect to MongoDB asynchronously without crashing the process on cold start
connectDB().catch((err) => {
  console.error('Initial DB connection attempt failed:', err.message);
});

// Ensure DB is connected for API requests
app.use(async (req, res, next) => {
  // Let health check pass through even if DB is still connecting
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed: ' + err.message + '. Please ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.'
    });
  }
});

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files - profile pictures
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_PATH || 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/academic', require('./routes/academic'));
app.use('/api/core-team', require('./routes/coreTeam'));
app.use('/api/events', require('./routes/events'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    message: 'YPDC LGU API is running.',
    timestamp: new Date(),
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

// Only listen locally, NEVER in Vercel Serverless
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 YPDC LGU API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

module.exports = app;
