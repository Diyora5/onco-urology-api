const client = require('prom-client');

// Ensure metrics are registered once.
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
});

const httpRequestCount = new client.Counter({
  name: 'http_request_total',
  help: 'HTTP request count',
  labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDurationMs);
register.registerMetric(httpRequestCount);

function metricsMiddleware(req, res, next) {
  const end = process.hrtime.bigint();

  res.on('finish', () => {
    const diffNs = Number(process.hrtime.bigint() - end);
    const durationMs = diffNs / 1e6;

    const route = req.route?.path || req.path;
    const status = res.statusCode;

    httpRequestDurationMs.observe({ method: req.method, route, status_code: String(status) }, durationMs);
    httpRequestCount.inc({ method: req.method, route, status_code: String(status) });
  });

  next();
}

async function metricsHandler(req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = { metricsMiddleware, metricsHandler };

