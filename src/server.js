import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/index.js';
import { connectDB, disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis, isRedisEnabled } from './config/redis.js';
import { initSocket } from './sockets/index.js';
import logger from './utils/logger.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    credentials: true,
  },
});

initSocket(io);
app.set('io', io);

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectDB();
    await disconnectRedis();
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

const start = async () => {
  try {
    await connectDB();
    if (isRedisEnabled()) {
      try {
        await connectRedis();
        const { initWorkers } = await import('./jobs/queues.js');
        await initWorkers();
      } catch (redisErr) {
        logger.warn('Redis unavailable, running without cache/queues:', redisErr.message);
      }
    } else {
      logger.info('Redis disabled — API running without cache/background jobs');
    }

    server.listen(config.port, () => {
      logger.info(`TaskFlow API running on port ${config.port} [${config.env}]`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (err) => logger.error('Unhandled Rejection:', err));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

start();
