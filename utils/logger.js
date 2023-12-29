import { createLogger, transports, format } from 'winston';
export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.json({ space: '', replacer: null }),
  ),
  transports: [
    new transports.Console(
      // colorize,
    ),
  ],
  exceptionHandlers: [
    new transports.Console(
      // colorize
    ),
  ],
  rejectionHandlers: [
    new transports.Console(
      // colorize
    ),
  ],
}); 
