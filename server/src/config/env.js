require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 4000,
  apiVersion: process.env.API_VERSION || 'v1',
  // Number of reverse proxies in front of the API (0 = none). Set to 1 behind nginx / a hosting
  // platform proxy so each student's own IP is used for rate limiting, not the proxy's.
  trustProxy: Number(process.env.TRUST_PROXY) || 0,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 120,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'ccc_pathfinder',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
};
