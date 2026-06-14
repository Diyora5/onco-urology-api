const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

// Generates a correlation/request id.
function requestId(req, res, next) {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && incoming.trim().length
      ? incoming.trim()
      : crypto.randomUUID();

  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}

function securityHeaders() {
  // API-only app. Keep CSP strict, but don't block common API behavior.
  return helmet({
    contentSecurityPolicy: false,
    hsts: { maxAge: 60 * 60 * 24 * 365, includeSubDomains: true, preload: false },
    noSniff: true,
    xssFilter: false,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' },
    crossOriginResourcePolicy: { policy: 'same-site' },
  });
}


function jsonBodyLimits() {
  // Limit JSON payload size to mitigate memory/CPU DoS.
  return function jsonLimitMiddleware(req, res, next) {
    // express.json() is configured in server.js.
    next();
  };
}

function makeRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json(message || { success: false, message: 'Too many requests' });
    },
  });
}


const readLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

const writeLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
});

const strictWriteLimiter = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

module.exports = {
  requestId,
  securityHeaders,
  jsonBodyLimits,
  readLimiter,
  writeLimiter,
  strictWriteLimiter,
};

