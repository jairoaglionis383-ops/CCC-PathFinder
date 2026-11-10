const { error } = require('../utils/apiResponse');
module.exports = (req, res) => error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
