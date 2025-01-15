export interface ILoggerService {
  info(message: string): void;
  error(message: string, meta?: any): void;
  warn(message: string): void;
  debug(message: string): void;
}
