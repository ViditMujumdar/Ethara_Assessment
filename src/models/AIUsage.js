import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    provider: { type: String, enum: ['openai', 'gemini', 'claude'], default: 'openai' },
    feature: { type: String, required: true },
    tokensUsed: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    requestData: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

aiUsageSchema.index({ createdAt: -1 });

const AIUsage = mongoose.model('AIUsage', aiUsageSchema);
export default AIUsage;
