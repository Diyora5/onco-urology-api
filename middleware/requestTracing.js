const crypto = require('crypto');

function requestTracing(req, res, next) {
  // Correlation id (already present via security.js requestId middleware)
  // Add W3C traceparent if your gateway/OTel collector supports it.

  // Keep minimal and backward compatible.
  if (!req.headers['x-request-id']) {
    const fallback = crypto.randomUUID();
    req.headers['x-request-id'] = fallback;
  }

  // If upstream provides traceparent, keep it; otherwise leave it.
  // OpenTelemetry auto-instrumentations will use incoming context when present.
  next();
}

module.exports = { requestTracing };

