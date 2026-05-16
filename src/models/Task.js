import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const attachmentSchema = new mongoose.Schema({
  url: String,
  publicId: String,
  filename: String,
  mimetype: String,
  size: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: { type: Date, index: true },
    startDate: Date,
    labels: [{ type: String, trim: true }],
    position: { type: Number, default: 0 },
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    attachments: [attachmentSchema],
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      interval: { type: Number, default: 1 },
    },
    activityLogs: [{
      action: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      details: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

taskSchema.index({ workspace: 1, status: 1, position: 1 });
taskSchema.index({ workspace: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

const Task = mongoose.model('Task', taskSchema);
export default Task;
