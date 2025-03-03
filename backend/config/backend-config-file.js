// backend/config/config.js
require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ugc_agency_dashboard',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '1d',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // File upload configuration
  uploadDir: 'uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  // API URLs
  apiUrl: process.env.API_URL || 'http://localhost:5000/api'
};

module.exports = config;
