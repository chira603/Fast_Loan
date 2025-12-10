const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');
const paymentRoutes = require('./routes/payments');
const contactRoutes = require('./routes/contact');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const delayRoutes = require('./routes/delays');
const flexRoutes = require('./routes/flex');
const walletRoutes = require('./routes/wallet');
const billRoutes = require('./routes/bills');
const avatarRoutes = require('./routes/avatar');
const budgetRoutes = require('./routes/budget');
const creditCardRoutes = require('./routes/creditCard');
const rechargeRoutes = require('./routes/recharge');
const otpRoutes = require('./routes/otp');
const loanPaymentRoutes = require('./routes/loanPayments');
const disbursementRoutes = require('./routes/disbursements');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://10.212.189.193:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FAST LOAN API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/loans`, loanRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/contact`, contactRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/profile`, profileRoutes);
app.use(`/api/${API_VERSION}/delays`, delayRoutes);
app.use(`/api/${API_VERSION}/flex`, flexRoutes);
app.use(`/api/${API_VERSION}/wallet`, walletRoutes);
app.use(`/api/${API_VERSION}/bills`, billRoutes);
app.use(`/api/${API_VERSION}/avatar`, avatarRoutes);
app.use(`/api/${API_VERSION}/budget`, budgetRoutes);
app.use(`/api/${API_VERSION}/credit-card`, creditCardRoutes);
app.use(`/api/${API_VERSION}/recharge`, rechargeRoutes);
app.use(`/api/${API_VERSION}/otp`, otpRoutes);
app.use(`/api/${API_VERSION}/loan-payments`, loanPaymentRoutes);
app.use(`/api/${API_VERSION}/disbursements`, disbursementRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
      console.log(`🌐 Network URL: http://10.212.189.193:${PORT}/api/${API_VERSION}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
