import cron from 'node-cron';
import User from '../models/User.js';

// This runs every 5 minutes
const deleteUnverifiedUsers = () => {
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();

    try {
      const result = await User.deleteMany({
        emailVerified: false,
        emailOTPExpiry: { $lt: now }
      });

      if (result.deletedCount > 0) {
        console.log(`🗑️ Deleted ${result.deletedCount} unverified users.`);
      }
    } catch (err) {
      console.error('Error deleting unverified users:', err);
    }
  });
};

export default deleteUnverifiedUsers;
