import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { logError, logRequest } from './utils/logger.js';
import initializeDatabase from './database/init.js';
import migrateDatabase from './database/migrate.js';
import startRefreshTokenCleanup from './jobs/refreshTokenCleanup.js';

// Load environment variables
dotenv.config();

// ✅ SECURITY: Validate required environment variables at startup
const requiredEnvVars = [
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'PAYSTACK_SECRET_KEY',
  'PAYSTACK_PUBLIC_KEY',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// ✅ SECURITY: Warn if running in development with non-standard secrets
if (process.env.NODE_ENV === 'production') {
  if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ CRITICAL: JWT_SECRET must be at least 32 characters in production');
    process.exit(1);
  }
  if (process.env.JWT_SECRET.includes('change_in_production') || process.env.JWT_SECRET.includes('secret')) {
    console.error('❌ CRITICAL: Do not use default/example JWT_SECRET values in production');
    process.exit(1);
  }
}

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import tutorRoutes from './routes/tutor.js';
import bookingRoutes from './routes/booking.js';
import partnerRoutes from './routes/partner.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';
import uploadRoutes from './routes/upload.js';
import addressRoutes from './routes/addresses.js';
import categoriesRoutes from './routes/categories.js';

const app = express();

// Initialize app with async startup
(async () => {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Run database migrations
    await migrateDatabase();

    // Start refresh token cleanup job (periodic)
    try {
      startRefreshTokenCleanup();
    } catch (err) {
      console.error('Failed to start refresh token cleanup job:', err && err.message ? err.message : err);
    }

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Enable response compression for gzip
    app.use(compression({
      level: 6, // Balance between compression ratio and CPU usage
      threshold: 1024 // Only compress responses larger than 1KB
    }));

    // CORS Configuration - Accept localhost (dev), production domain, and env-configured frontend
    const allowedOrigins = [
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'https://bitmineroboticscw.cloud',
      'https://www.bitmineroboticscw.cloud'
    ];

    // Add FRONTEND_URL from env if it exists and is not already in list
    if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    app.use(cors({
      origin: (origin, callback) => {
        // Allow no origin (mobile apps, curl, Postman)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowlist
        const isAllowed = allowedOrigins.some(allowedOrigin => 
          origin === allowedOrigin || origin.endsWith(allowedOrigin.replace(/^https?:\/\//, ''))
        );

        if (isAllowed) {
          return callback(null, true);
        }

        // Log blocked origins for debugging
        console.warn('⚠️ CORS: Blocked request from origin:', origin);
        console.warn('   Allowed origins:', allowedOrigins.join(', '));
        
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
      
    app.use(morgan('dev'));

    // Request logging middleware
    app.use(logRequest);

    // Cache control middleware for static assets
    app.use((req, res, next) => {
      // Don't cache API responses
      if (req.path.startsWith('/api/')) {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
      }
      next();
    });

    // Rate Limiting - Protect against brute force
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });

    // Apply rate limiting to all API routes
    app.use('/api/', limiter);

    // Stricter rate limiting for auth routes
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5, // 5 attempts per 15 minutes
      message: 'Too many login/signup attempts, please try again later.'
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/categories', categoriesRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/contact', contactRoutes);
    app.use('/api/newsletter', newsletterRoutes);
    app.use('/api/tutor', tutorRoutes);
    app.use('/api/booking', bookingRoutes);
    app.use('/api/partner', partnerRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/addresses', addressRoutes);

    // Serve uploaded files statically
    app.use('/uploads', express.static('./uploads'));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'BitMine Backend is running' });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      // Log the error
      logError(err, req);
      
      // Send error response
      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 BitMine Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
