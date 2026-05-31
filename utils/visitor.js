// Extract optional visitor identifiers from the request.
// Auth is not used, so these are best-effort and may be null.
function getVisitorInfo(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const visitorIp =
    (typeof forwarded === 'string' && forwarded.split(',')[0].trim()) ||
    req.socket?.remoteAddress ||
    null;

  return {
    visitorIp,
    userAgent: req.headers['user-agent'] || null,
  };
}

module.exports = { getVisitorInfo };
