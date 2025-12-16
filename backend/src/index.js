import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { logError, logRequest } from './utils/logger.js';
import initializeDatabase from './database/init.js';
import migrateDatabase from './database/migrate.js';

// Load environment variables
dotenv.config();

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

const app = express();

// Initialize app with async startup
(async () => {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Run database migrations
    await migrateDatabase();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Enable response compression for gzip
    app.use(compression({
      level: 6, // Balance between compression ratio and CPU usage
      threshold: 1024 // Only compress responses larger than 1KB
    }));

    // CORS Configuration - Accept all localhost ports for development
    app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:5174',
          'http://localhost:5175',
          'http://localhost:5176',
          'http://localhost:5177',
          'http://localhost:5178',
          process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
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
