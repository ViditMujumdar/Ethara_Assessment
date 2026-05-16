import { config } from '../config/index.js';
import logger from '../utils/logger.js';

let workersStarted = false;

/** Start BullMQ workers only when Redis is enabled. */
export const initWorkers = async () => {
  if (!config.redisEnabled) {
    logger.info('Background jobs disabled (REDIS_ENABLED=false)');
    return;
  }
  if (workersStarted) return;

  const { Queue, Worker } = await import('bullmq');
  const { sendEmail } = await import('../utils/email.js');
  const notificationService = await import('../services/notification.service.js');
  const connection = { url: config.redisUrl };

  new Worker('email', async (job) => {
    await sendEmail(job.data);
    logger.info(`Email sent: ${job.data.subject}`);
  }, { connection });

  new Worker('notifications', async (job) => {
    await notificationService.createNotification(job.data);
  }, { connection });

  new Worker('deadlines', async (job) => {
    const { userId, taskTitle, taskId } = job.data;
    await notificationService.createNotification({
      user: userId,
      type: 'deadline',
      title: 'Task deadline approaching',
      message: `"${taskTitle}" is due soon`,
      link: `/tasks/${taskId}`,
    });
  }, { connection });

  workersStarted = true;
  logger.info('BullMQ workers initialized');
};

export const scheduleDeadlineReminder = async (data, delay) => {
  if (!config.redisEnabled) return;
  const { Queue } = await import('bullmq');
  const queue = new Queue('deadlines', { connection: { url: config.redisUrl } });
  await queue.add('reminder', data, { delay });
  await queue.close();
};

export default { initWorkers, scheduleDeadlineReminder };
