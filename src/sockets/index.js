import { verifyAccessToken } from '../utils/jwt.js';
import * as chatService from '../services/chat.service.js';
import * as notificationService from '../services/notification.service.js';
import logger from '../utils/logger.js';

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.userId}`);
    onlineUsers.set(socket.userId, socket.id);

    socket.on('join:workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      socket.to(`workspace:${workspaceId}`).emit('presence:online', { userId: socket.userId });
    });

    socket.on('leave:workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on('task:update', (data) => {
      socket.to(`workspace:${data.workspaceId}`).emit('task:updated', data);
    });

    socket.on('task:reorder', (data) => {
      socket.to(`workspace:${data.workspaceId}`).emit('task:reordered', data);
    });

    socket.on('chat:message', async (data) => {
      try {
        const message = await chatService.createMessage({
          workspace: data.workspaceId,
          channel: data.channel || 'general',
          sender: socket.userId,
          content: data.content,
          type: data.type || 'text',
          attachments: data.attachments,
          isDirect: !!data.recipientId,
          recipient: data.recipientId,
        });
        const room = data.recipientId
          ? `dm:${[socket.userId, data.recipientId].sort().join(':')}`
          : `workspace:${data.workspaceId}`;
        io.to(room).emit('chat:new_message', message);

        if (data.mentionUserIds?.length) {
          for (const userId of data.mentionUserIds) {
            await notificationService.createNotification({
              user: userId,
              workspace: data.workspaceId,
              type: 'mention',
              title: 'You were mentioned',
              message: data.content.slice(0, 100),
            });
          }
        }
      } catch (err) {
        socket.emit('chat:error', { message: err.message });
      }
    });

    socket.on('chat:typing', (data) => {
      socket.to(`workspace:${data.workspaceId}`).emit('chat:typing', {
        userId: socket.userId,
        channel: data.channel,
        isTyping: data.isTyping,
      });
    });

    socket.on('chat:reaction', async ({ messageId, emoji }) => {
      const message = await chatService.addReaction(messageId, socket.userId, emoji);
      io.emit('chat:reaction_updated', message);
    });

    socket.on('join:dm', (recipientId) => {
      const room = `dm:${[socket.userId, recipientId].sort().join(':')}`;
      socket.join(room);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      socket.broadcast.emit('presence:offline', { userId: socket.userId });
      logger.debug(`Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());
export default initSocket;
