import { fetchAndStoreNews } from './newsFeedService.js';

let schedulerInterval = null;

/**
 * Setup scheduled news fetching
 * Fetches news every hour by default
 */
export function setupNewsScheduler() {
  const intervalMinutes = parseInt(process.env.NEWS_FETCH_INTERVAL_MINUTES) || 60;
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`Setting up news scheduler: fetching every ${intervalMinutes} minutes`);

  // Initial fetch
  fetchAndStoreNews().catch(err => {
    console.error('Initial news fetch failed:', err);
  });

  // Schedule periodic fetches
  schedulerInterval = setInterval(() => {
    console.log('Scheduled news fetch triggered');
    fetchAndStoreNews().catch(err => {
      console.error('Scheduled news fetch failed:', err);
    });
  }, intervalMs);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      console.log('News scheduler stopped');
    }
  });

  process.on('SIGINT', () => {
    if (schedulerInterval) {
      clearInterval(schedulerInterval);
      console.log('News scheduler stopped');
    }
  });
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('News scheduler stopped');
  }
}

