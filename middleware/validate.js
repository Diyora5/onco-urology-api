const sanitizeHtml = require('sanitize-html');

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function toInt(v) {
  if (typeof v === 'number' && Number.isInteger(v)) return v;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

function asCleanText(v, { maxLen }) {
  if (v == null) return null;
  const str = String(v);
  const trimmed = str.trim();
  if (!trimmed.length) return null;

  // Strip all HTML tags. Prevent stored XSS payloads.
  const cleaned = sanitizeHtml(trimmed, {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (typeof maxLen === 'number' && cleaned.length > maxLen) {
    return cleaned.slice(0, maxLen);
  }
  return cleaned;
}

function requireIntParam(name) {
  return (req, res, next) => {
    const v = toInt(req.params[name]);
    if (v === null) {
      return res.status(400).json({ success: false, message: `${name} must be an integer` });
    }
    req.params[name] = v;
    next();
  };
}

function validateRequiredBodyString(field, { minLen = 1, maxLen = 2000 } = {}) {
  return (req, res, next) => {
    if (!isNonEmptyString(req.body?.[field])) {
      return res.status(400).json({ success: false, message: `${field} is required` });
    }

    const cleaned = asCleanText(req.body[field], { maxLen });
    if (!cleaned || cleaned.length < minLen) {
      return res.status(400).json({ success: false, message: `${field} is invalid` });
    }
    req.body[field] = cleaned;
    next();
  };
}

function validateOptionalCleanText(field, { maxLen = 2000 } = {}) {
  return (req, res, next) => {
    const v = req.body?.[field];
    if (v === undefined) return next();
    const cleaned = asCleanText(v, { maxLen });
    req.body[field] = cleaned;
    next();
  };
}

function validateEnum(field, allowed, message) {
  return (req, res, next) => {
    const v = req.body?.[field];
    if (!allowed.includes(v)) {
      return res.status(400).json({ success: false, message: message || `${field} is invalid` });
    }
    next();
  };
}

module.exports = {
  requireIntParam,
  validateRequiredBodyString,
  validateOptionalCleanText,
  validateEnum,
  asCleanText,
};

