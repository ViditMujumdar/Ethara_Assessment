import Redis from 'ioredis';
import { config } from './index.js';
import logger from '../utils/logger.js';

let redisClient = null;

export const isRedisEnabled = () => config.redisEnabled;

export const getRedis = () => {
  if (!config.redisEnabled) return null;
  if (!redisClient) {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error('Redis error:', err.message));
  }
  return redisClient;
};

export const connectRedis = async () => {
  if (!config.redisEnabled) return null;
  const redis = getRedis();
  if (redis.status !== 'ready') {
    await redis.connect();
  }
  return redis;
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
};

export default getRedis;
