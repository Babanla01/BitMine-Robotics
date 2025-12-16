// Logging utility for tracking errors and API calls
import fs from 'fs';
import path from 'path';

const logsDir = './logs';

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'errors.log');

export const logError = (error, req = null) => {
  const timestamp = new Date().toISOString();
  const method = req?.method || 'UNKNOWN';
  const url = req?.originalUrl || 'N/A';
  const statusCode = error.status || error.statusCode || 500;
  const message = error.message || 'Unknown error';
  const stack = error.stack || '';

  const logEntry = `
[${timestamp}] ERROR
Method: ${method}
URL: ${url}
Status: ${statusCode}
Message: ${message}
Stack: ${stack}
${'='.repeat(80)}
`;

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(logEntry);
  }

  // Log to file
  fs.appendFileSync(logFile, logEntry);
};

export const logRequest = (req, res, next) => {
  const start = Date.now();

  // Log request
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;

    const logEntry = `[${timestamp}] ${method} ${url} - ${status} (${duration}ms)\n`;

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(logEntry);
    }

    // Optionally log to file
    // fs.appendFileSync(logFile, logEntry);
  });

  next();
};

export default { logError, logRequest };
