import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'manager', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
  token: { type: String, required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, required: true },
});

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    invites: [inviteSchema],
    settings: {
      defaultView: { type: String, enum: ['kanban', 'calendar', 'timeline'], default: 'kanban' },
      isPublic: { type: Boolean, default: false },
    },
    isSuspended: { type: Boolean, default: false },
    storageUsed: { type: Number, default: 0 },
    activityLogs: [{
      action: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      details: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

workspaceSchema.index({ slug: 1 });
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

workspaceSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
  }
  next();
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
