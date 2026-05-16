import Message from '../models/Message.js';

export const getChannelMessages = async (workspaceId, channel, { page = 1, limit = 50 }) => {
  const skip = (page - 1) * limit;
  const messages = await Message.find({ workspace: workspaceId, channel, isDirect: false })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return messages.reverse();
};

export const getDirectMessages = async (userId, recipientId, { page = 1, limit = 50 }) => {
  const skip = (page - 1) * limit;
  const messages = await Message.find({
    isDirect: true,
    $or: [
      { sender: userId, recipient: recipientId },
      { sender: recipientId, recipient: userId },
    ],
  })
    .populate('sender recipient', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return messages.reverse();
};

export const createMessage = async (data) => {
  const message = await Message.create(data);
  return message.populate('sender', 'name email avatar');
};

export const addReaction = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) return null;
  const existing = message.reactions.find((r) => r.user.toString() === userId.toString() && r.emoji === emoji);
  if (existing) {
    message.reactions = message.reactions.filter((r) => !(r.user.toString() === userId.toString() && r.emoji === emoji));
  } else {
    message.reactions.push({ emoji, user: userId });
  }
  await message.save();
  return message.populate('sender', 'name email avatar');
};

export const searchMessages = async (workspaceId, query) => {
  return Message.find({
    workspace: workspaceId,
    content: { $regex: query, $options: 'i' },
  })
    .populate('sender', 'name email avatar')
    .limit(20);
};

export default { getChannelMessages, getDirectMessages, createMessage, addReaction, searchMessages };
