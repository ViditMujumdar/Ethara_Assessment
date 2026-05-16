import mongoose from 'mongoose';

const ADMIN_PERMISSIONS = [
  'manage_users', 'manage_subscriptions', 'manage_workspaces', 'manage_tasks',
  'view_analytics', 'view_logs', 'manage_reports', 'manage_ai',
];

const adminSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator', 'support'],
      default: 'support',
    },
    permissions: [{ type: String, enum: ADMIN_PERMISSIONS }],
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    activityLogs: [{
      action: String,
      details: mongoose.Schema.Types.Mixed,
      ip: String,
      timestamp: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

adminSchema.pre('save', function (next) {
  if (this.role === 'super_admin') {
    this.permissions = ADMIN_PERMISSIONS;
  }
  next();
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
