import { neon } from '@neondatabase/serverless';

/**
 * Deferred, build-safe Neon Database query runner.
 * Evaluates DATABASE_URL and instantiates the client dynamically at runtime,
 * preventing Next.js build-time compiler crashes when environment variables are blank.
 * 
 * @param {string} query - SQL query template
 * @param {Array} [params] - Parameterized query variables
 * @returns {Promise<any>} Query results
 */
export const db = async (query, params) => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not defined. Please configure it in your .env.local file.');
  }
  
  const client = neon(url);
  return client.query(query, params);
};
