const crypto = require('crypto');

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');

function buildResources() {
  const serviceName = process.env.OTEL_SERVICE_NAME || 'doctor-info-backend';
  const serviceVersion = process.env.npm_package_version || undefined;

  return new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || crypto.randomBytes(8).toString('hex'),
  });
}

function createOpenTelemetrySDK() {
  // Minimal overhead: only enable OTLP exporters when configured.
  const otlpTracesEndpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  const otlpMetricsEndpoint = process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;

  const traceExporter = otlpTracesEndpoint
    ? new OTLPTraceExporter({ url: otlpTracesEndpoint })
    : undefined;

  const metricExporter = otlpMetricsEndpoint
    ? new OTLPMetricExporter({ url: otlpMetricsEndpoint })
    : undefined;

  return new NodeSDK({
    resource: buildResources(),
    traceExporter,
    metricReader: metricExporter ? { export: (opts) => metricExporter.export(opts) } : undefined,
    instrumentations: [getNodeAutoInstrumentations()],
  });
}

module.exports = {
  createOpenTelemetrySDK,
};

