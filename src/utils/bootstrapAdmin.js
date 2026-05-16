import Admin from '../models/Admin.js';
import User from '../models/User.js';

/** Grant platform admin access (Admin doc + user.role). */
export const grantAdminAccess = async (userId, role = 'super_admin') => {
  const user = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
  if (!user) return null;

  const admin = await Admin.findOneAndUpdate(
    { user: userId },
    { user: userId, role, isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return { user, admin };
};

/** First registered user becomes super admin when no admins exist yet. */
export const bootstrapFirstAdmin = async (userId) => {
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) return null;
  return grantAdminAccess(userId, 'super_admin');
};

export default { grantAdminAccess, bootstrapFirstAdmin };
