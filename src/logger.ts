import { createLogger, format, transports } from 'winston';
import { env } from './env';

export const logger = createLogger({
    level: env.debug ? 'debug' : 'warn',
    defaultMeta: {server: "feishu-mcp-server"},
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'logs/feishu-mcp-server.log' }),
    ]
});

if (env.debug) {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }))
}
