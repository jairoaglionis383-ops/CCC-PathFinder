// Basic hardening headers for an API that only returns JSON.
// (Small hand-written stand-in for the `helmet` package, to avoid a new dependency.)
module.exports = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  // Results contain a student's scores: do not let browsers/proxies cache them.
  res.setHeader('Cache-Control', 'no-store');
  next();
};
