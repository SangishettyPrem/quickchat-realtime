import { createLogger, transports, format } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
    ),
    transports: [
        new transports.Console(), // logs to console
        new transports.File({ filename: 'logs/error.log', level: 'error' }), // error logs
        new transports.File({ filename: 'logs/combined.log' }) // all logs
    ]
});

export default logger;
