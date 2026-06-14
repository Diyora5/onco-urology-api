require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const employeeRoutes = require('./routes/employeeRoutes');
const {
  requestId,
  securityHeaders,
  readLimiter,
  writeLimiter,
  strictWriteLimiter,
} = require('./middleware/security');

const commentRoutes = require('./routes/commentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const employeeProfileRoutes = require('./routes/employeeProfile.routes');
const employeeWorkExperienceRoutes = require('./routes/employeeWorkExperience.routes');
const employeeEducationRoutes = require('./routes/employeeEducation.routes');
const departmentInfoRoutes = require('./routes/departmentInfoRoutes');

const { requestTracing } = require('./middleware/requestTracing');
const { logger } = require('./middleware/structuredLogger');
const { metricsMiddleware, metricsHandler } = require('./middleware/metrics');
const { errorLogger } = require('./middleware/errorLogger');
const healthRoutes = require('./routes/healthRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// ---- Observability (low overhead) ----
// Start OpenTelemetry if enabled.
// OpenTelemetry is optional. If dependencies are missing or OTEL isn't configured,
// the app continues to run with logs + metrics only.
const otelEnabled = !!process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || !!process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
if (otelEnabled) {
  try {
    const { createOpenTelemetrySDK } = require('./config/observability');
    const otelSdk = createOpenTelemetrySDK();
    otelSdk.start().catch((e) => logger.error('otel_start_failed', { error: e.message }));
  } catch (e) {
    logger.warn('otel_disabled_dependency_missing', { reason: e.message });
  }
}

// Middleware
app.use(requestId);
app.use(requestTracing);
app.use(metricsMiddleware);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: false,
}));
app.use(securityHeaders());
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '64kb' }));

// Metrics endpoint (Prometheus)
app.get('/metrics', metricsHandler);

// Health endpoints (k8s style)
app.use('/health', healthRoutes);
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Doctor info API is running' });
});


// API routes
app.use('/api/employees', readLimiter, employeeRoutes);
app.use('/api/department-info', readLimiter, departmentInfoRoutes);
app.use('/api/comments', readLimiter, commentRoutes);
app.use('/api/analytics', readLimiter, analyticsRoutes);
// Profile / work-experience / education routers define their full sub-paths.
app.use('/api', writeLimiter, employeeProfileRoutes);
app.use('/api', writeLimiter, employeeWorkExperienceRoutes);
app.use('/api', writeLimiter, employeeEducationRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error logging (structured)
app.use(errorLogger);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});


async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // IMPORTANT: Production must not mutate schema automatically.
    // All schema changes must be applied via Sequelize migrations.
    // (If you need dev-only sync, use a dedicated dev script, not production startup.)
    console.log('Skipping sequelize.sync() - use migrations for schema management.');


    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
