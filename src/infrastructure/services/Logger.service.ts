import { injectable } from 'inversify';
import { createLogger, format, transports } from 'winston';
import type { ILoggerService } from '@/domain/services/ILogger.service';

@injectable()
class Logger implements ILoggerService {
  private readonly INFO_FILE: string = 'logs/info.log';
  private readonly ERROR_FILE: string = 'logs/error.log';
  private readonly WARN_FILE: string = 'logs/warn.log';

  private static instance: Logger;
  private readonly logger: ReturnType<typeof createLogger>;

  private readonly transportsLocal = [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    }),
    new transports.File({ filename: this.INFO_FILE, level: 'info' }),
    new transports.File({ filename: this.ERROR_FILE, level: 'error' }),
    new transports.File({ filename: this.WARN_FILE, level: 'warn' }),
  ];

  private readonly transportsProd = [
    new transports.Console({
      level: 'warn',
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    }),
    new transports.File({ filename: this.ERROR_FILE, level: 'error' }),
    new transports.File({ filename: this.WARN_FILE, level: 'warn' }),
  ];

  constructor() {
    this.logger = createLogger({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
      transports: this.isLocalEnv ? this.transportsLocal : this.transportsProd,
    });
  }

  private get isLocalEnv(): boolean {
    return process.env.ENV_TYPE === 'local';
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
    if (!this.isLocalEnv) return;
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
    if (!this.isLocalEnv) return;
    this.logger.debug(message);
  }
}

export default Logger;
