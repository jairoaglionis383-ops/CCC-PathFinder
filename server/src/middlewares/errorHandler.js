const { error } = require('../utils/apiResponse');
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  // Log only the error code/message (never the request body or the full
  // error object) so student names and answers do not end up in server logs.
  if (status >= 500) console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${status}: ${err.code || ''} ${err.message}`);
  return error(res, status >= 500 ? 'Internal server error' : err.message, status);
};
