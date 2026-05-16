import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { config } from './config/index.js';
import v1Routes from './routes/v1/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { getConnectionStatus } from './config/db.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: config.isProd,
}));

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(compression());
app.use(morgan(config.isProd ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests' },
});
app.use('/api', limiter);

app.get('/health', (_req, res) => {
  const db = getConnectionStatus();
  res.status(db.isConnected ? 200 : 503).json({
    success: db.isConnected,
    status: db.isConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: db,
    environment: config.env,
  });
});

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'TaskFlow Manager API',
    version: config.apiVersion,
  });
});

app.use(`/api/${config.apiVersion}`, v1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
