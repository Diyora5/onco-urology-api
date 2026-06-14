const winston = require('winston');

function createLogger() {
  const isProd = process.env.NODE_ENV === 'production';

  return winston.createLogger({
    level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
    defaultMeta: {
      service: process.env.OTEL_SERVICE_NAME || 'doctor-info-backend',
      env: process.env.NODE_ENV || 'development',
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        stderrLevels: ['error'],
      }),
    ],
  });
}

const logger = createLogger();

module.exports = { logger };

