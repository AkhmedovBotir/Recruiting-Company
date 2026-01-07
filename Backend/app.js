const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const adminApplicationRoutes = require('./routes/adminApplicationRoutes');
const adminMaterialRoutes = require('./routes/adminMaterialRoutes');
const companyRoutes = require('./routes/companyRoutes');
const vacancyRoutes = require('./routes/vacancyRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const webVacancyRoutes = require('./routes/webVacancyRoutes');
const webApplicationRoutes = require('./routes/webApplicationRoutes');
const webMaterialRoutes = require('./routes/webMaterialRoutes');
const webSavedVacancyRoutes = require('./routes/webSavedVacancyRoutes');
const webAppRoutes = require('./routes/webAppRoutes');
const webTestResultRoutes = require('./routes/webTestResultRoutes');
const adminTestResultRoutes = require('./routes/adminTestResultRoutes');
const adminInterviewRoutes = require('./routes/adminInterviewRoutes');
const webInterviewRoutes = require('./routes/webInterviewRoutes');
const adminCertificateRoutes = require('./routes/adminCertificateRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const webCertificateRoutes = require('./routes/webCertificateRoutes');
const companyIntegrationRoutes = require('./routes/companyIntegrationRoutes');
const botRoutes = require('./routes/botRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));

// Serve static files from public directory
app.use(express.static('public'));

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
app.use('/api/admin/materials', adminMaterialRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/web/vacancies', webVacancyRoutes);
app.use('/api/web/applications', webApplicationRoutes);
app.use('/api/web/materials', webMaterialRoutes);
app.use('/api/web/saved-vacancies', webSavedVacancyRoutes);
app.use('/api/web-app', webAppRoutes);
app.use('/api/web/test-results', webTestResultRoutes);
app.use('/api/admin/test-results', adminTestResultRoutes);
app.use('/api/admin/interviews', adminInterviewRoutes);
app.use('/api/web/interviews', webInterviewRoutes);
app.use('/api/admin/certificates', adminCertificateRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/web/certificates', webCertificateRoutes);
app.use('/api/company-integration', companyIntegrationRoutes);
app.use('/api/bot', botRoutes);

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

