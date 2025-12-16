import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import passport from './config/passport';
import logger from './lib/logger';
import { errorHandler } from './middleware/error-handler';

// Import routes
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import tenantRoutes from './routes/tenants';
import datasetRoutes from './routes/datasets';
import jobRoutes from './routes/jobs';
import memberRoutes from './routes/members';
import apiKeyRoutes from './routes/api-keys';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/tenants', datasetRoutes);
app.use('/api/tenants', jobRoutes);
app.use('/api/tenants', memberRoutes);
app.use('/api/tenants', apiKeyRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server (only if not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

export default app;
