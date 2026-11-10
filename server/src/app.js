const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');
const securityHeaders = require('./middlewares/securityHeaders');
const rateLimit = require('./middlewares/rateLimit');

const app = express();
app.disable('x-powered-by');
if (env.trustProxy > 0) app.set('trust proxy', env.trustProxy);
app.use(securityHeaders);
app.use(cors({ origin: env.clientOrigin }));
// 120 requests / minute / IP by default (one student flow uses about 6)
app.use(`/api/${env.apiVersion}`, rateLimit(env.rateLimit));
app.use(express.json({ limit: '100kb' }));
app.use(`/api/${env.apiVersion}`, routes);
app.use(notFoundHandler);
app.use(errorHandler);
module.exports = app;
