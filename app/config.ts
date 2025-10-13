/**
 * Configuration settings for the application
 */

/**
 * Feature flag to determine if we should use mock data for local development
 * Set USE_MOCK_DATA=true in your environment to enable this
 */
export const isLocalDevelopment = process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_DATA === 'true';
