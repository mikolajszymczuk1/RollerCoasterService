import dotenv from 'dotenv';
import { container } from '@/config/container';
import { ContainerTypes } from '@/types/common';
import type { ILoggerService } from '@/domain/services/ILogger.service';

const logger = container.get<ILoggerService>(ContainerTypes.Logger);

/** Load all env variables based on env type */
export const loadEnvironment = (): void => {
  const envType = process.env.ENV_TYPE ?? 'local';
  const envFile = `.env.${envType}`;

  dotenv.config({ path: envFile });

  logger.info(`Environment loaded: ${envType}`);
};
