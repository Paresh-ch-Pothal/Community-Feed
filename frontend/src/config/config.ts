/**
 * Application Configuration
 * Centralized config for timeouts, intervals, and other constants
 */

export const CONFIG = {
  // Refresh intervals (in milliseconds)
  LEADERBOARD_REFRESH_INTERVAL: 120000, // 2 minutes
  
  // Alternative intervals you might want to use:
  // LEADERBOARD_REFRESH_INTERVAL: 60000,   // 1 minute
  // LEADERBOARD_REFRESH_INTERVAL: 180000,  // 3 minutes
  // LEADERBOARD_REFRESH_INTERVAL: 300000,  // 5 minutes
  // LEADERBOARD_REFRESH_INTERVAL: 600000,  // 10 minutes

  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  
  // Pagination
  POSTS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 20,
  
  // UI Configuration
  MAX_COMMENT_DEPTH: 3,
  LEADERBOARD_TOP_N: 5,
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300, // 300ms for search/input debouncing
};

export default CONFIG;