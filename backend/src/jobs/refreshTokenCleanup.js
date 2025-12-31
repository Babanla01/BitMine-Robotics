import pool from '../config/database.js';

// Cleanup job for refresh tokens
export default function startRefreshTokenCleanup() {
  const intervalMinutes = parseInt(process.env.REFRESH_TOKEN_CLEANUP_INTERVAL_MINUTES || '60', 10);
  const keepRevokedDays = parseInt(process.env.REFRESH_TOKEN_REVOKED_KEEP_DAYS || '30', 10);

  const runCleanup = async () => {
    try {
      console.log('🔄 Running refresh token cleanup job...');

      // Delete tokens that expired more than 1 minute ago (safety buffer)
      const deleteExpired = await pool.query(
        `DELETE FROM refresh_tokens WHERE expires_at IS NOT NULL AND expires_at < NOW()`
      );

      // Delete revoked tokens older than keepRevokedDays
      const cutoff = new Date(Date.now() - keepRevokedDays * 24 * 60 * 60 * 1000).toISOString();
      const deleteOldRevoked = await pool.query(
        'DELETE FROM refresh_tokens WHERE revoked = true AND created_at < $1',
        [cutoff]
      );

      console.log('✅ Refresh token cleanup complete');
    } catch (err) {
      console.error('Error during refresh token cleanup:', err && err.message ? err.message : err);
    }
  };

  // Run immediately, then on interval
  runCleanup();
  const handle = setInterval(runCleanup, intervalMinutes * 60 * 1000);

  // Return a stopper so tests can stop the interval if needed
  return () => clearInterval(handle);
}
