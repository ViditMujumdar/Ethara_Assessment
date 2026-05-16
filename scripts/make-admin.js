/**
 * Grant admin access to a user.
 * Usage:
 *   node scripts/make-admin.js --first
 *   node scripts/make-admin.js user@example.com
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import User from '../src/models/User.js';
import { grantAdminAccess } from '../src/utils/bootstrapAdmin.js';

dotenv.config();

if (process.platform === 'win32') {
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
}

const arg = process.argv[2];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  let user;
  if (arg === '--first') {
    user = await User.findOne().sort({ createdAt: 1 });
  } else if (arg) {
    user = await User.findOne({ email: arg.toLowerCase() });
  } else {
    console.error('Provide an email or --first');
    process.exit(1);
  }

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  const result = await grantAdminAccess(user._id, 'super_admin');
  console.log(`Admin granted to ${result.user.email} (${result.admin.role})`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
