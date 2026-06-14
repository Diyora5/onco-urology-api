const { logger } = require('./structuredLogger');

function errorLogger(err, req, res, next) {
  // Correlate via x-request-id (set by security.js requestId middleware)
  const requestId = req.requestId || req.headers['x-request-id'];

  logger.error('request_error', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    status: err.status || 500,
    message: err.message,
    // avoid serializing huge objects
    stack: err.stack,
  });

  next(err);
}

module.exports = { errorLogger };

