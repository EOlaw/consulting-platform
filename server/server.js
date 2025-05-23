/**
 * Main server file
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const path = require('path');
const { AppError } = require('./utils/app-error');
const connectDB = require('./config/database');
const config = require('./config/config');

// Import route files
const userRoutes = require('./users/routes/user-routes');
const authRoutes = require('./security/routes/auth-routes');
const organizationRoutes = require('./organizations/routes/organization-routes');
const projectRoutes = require('./projects/routes/project-routes');
const caseStudyRoutes = require('./case-studies/routes/case-study-routes');
const newsletterRoutes = require('./newsletter/routes/newsletter-routes');
const blogRoutes = require('./blog/routes/blog-routes');
const serviceRoutes = require('./services/routes/service-routes');
const contactFormRoutes = require('./marketing/routes/contact-form-routes');
// Import other routes when created

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: ['http://localhost:3000', 'http://0.0.0.0:3000', 'http://10.0.0.218:3000', 'http://localhost:5001'],  // Allow both localhost and IP access
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Access-Control-Allow-Origin'],
  maxAge: 86400 // 24 hours
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(cors({
//   origin: config.CLIENT_URL || ['http://localhost:3000', 'http://0.0.0.0:3000', 'http://localhost:5000'],
//   credentials: true
// }));

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize passport
app.use(passport.initialize());
require('./passport/passport-config')(passport);

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/case-studies', caseStudyRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/contact', contactFormRoutes);
// Add more route handlers as they are created

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Consulting Platform API',
    version: '1.0.0'
  });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Different response for development and production
  if (config.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production mode - don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or other unknown errors
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
});

// Start server
const PORT = config.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
