import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  emoji: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const messageSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', index: true },
    channel: { type: String, default: 'general' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
    attachments: [{
      url: String,
      filename: String,
      mimetype: String,
    }],
    reactions: [reactionSchema],
    isDirect: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

messageSchema.index({ workspace: 1, channel: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
