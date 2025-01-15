import { container } from '@/config/container';
import { ContainerTypes } from '@/types/common';
import App from '@/app';
import { ILoggerService } from '@/domain/services/ILogger.service';
import { loadEnvironment } from '@/config/environment';

const logger = container.get<ILoggerService>(ContainerTypes.Logger);

/** Setup and run app */
const bootstrap = async (): Promise<void> => {
  loadEnvironment();
  const app = container.get<App>(ContainerTypes.App);
  await app.initializeServices();

  const PORT = process.env.PORT ?? '8080';

  app.app.listen(PORT, (): void => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
};

bootstrap().catch((error) => {
  logger.error(`Error during application bootstrap: ${error}`);
  process.exit(1);
});
