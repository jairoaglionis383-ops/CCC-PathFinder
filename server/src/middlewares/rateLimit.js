const { error } = require('../utils/apiResponse');

// Tiny in-memory, per-IP rate limiter (fixed window). Enough to slow down
// guessing of session ids and request floods on a single-server prototype.
// It resets when the server restarts, and it does not share state between
// several server instances. Limits can be changed in .env (RATE_LIMIT_*).
function rateLimit({ windowMs, max }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return error(res, 'Too many requests. Please wait a moment and try again.', 429);
    }
    return next();
  };
}
module.exports = rateLimit;
