import { injectable } from 'inversify';
import { createLogger, format, transports } from 'winston';

@injectable()
class Logger {
  private static instance: Logger;
  private readonly logger: ReturnType<typeof createLogger>;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ level, message, timestamp }) => {
              return `[${timestamp}] ${level}: ${message}`;
            }),
          ),
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/warn.log', level: 'warn' }),
      ],
    });
  }

  /**
   * Get instance ofr logger or create new one
   * @returns {Logger} logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  /**
   * Log info message
   * @param {string} message message to log
   */
  public info(message: string): void {
    this.logger.info(message);
  }

  /**
   * Log error message
   * @param {string} message message to log
   */
  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * Log warn message
   * @param {string} message message to log
   */
  public warn(message: string): void {
    this.logger.warn(message);
  }

  /**
   * Log debug message
   * @param {string} message message to log
   */
  public debug(message: string): void {
    this.logger.debug(message);
  }
}

export default Logger;
