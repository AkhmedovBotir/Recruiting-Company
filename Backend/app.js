const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const adminApplicationRoutes = require('./routes/adminApplicationRoutes');
const companyRoutes = require('./routes/companyRoutes');
const vacancyRoutes = require('./routes/vacancyRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const webVacancyRoutes = require('./routes/webVacancyRoutes');
const webApplicationRoutes = require('./routes/webApplicationRoutes');
const webAppRoutes = require('./routes/webAppRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/applications', adminApplicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/web/vacancies', webVacancyRoutes);
app.use('/api/web/applications', webApplicationRoutes);
app.use('/api/web-app', webAppRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;

