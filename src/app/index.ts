import 'reflect-metadata';
import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { json } from 'body-parser';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '@/types/common';
import type { ILoggerService } from '@/domain/services/ILogger.service';
import type { IRedisClient } from '@/domain/database/IRedis.client';
import rollercoasterRouter from '@/app/routes/rollercoaster.router';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';
import type { ISubManagerService } from '@/domain/services/redis/ISubManager.service';

@injectable()
export class App {
  private readonly logger: ILoggerService;
  private readonly redisClient: IRedisClient;
  private readonly leaderManagerService: ILeaderManagerService;
  private readonly subManagerService: ISubManagerService;

  public app: Application;

  constructor(
    @inject(ContainerTypes.Logger) logger: ILoggerService,
    @inject(ContainerTypes.RedisClient) redisClient: IRedisClient,
    @inject(ContainerTypes.LeaderManagerService) leaderManagerService: ILeaderManagerService,
    @inject(ContainerTypes.SubManagerService) subManagerService: ISubManagerService,
  ) {
    this.logger = logger;
    this.redisClient = redisClient;
    this.leaderManagerService = leaderManagerService;
    this.subManagerService = subManagerService;

    this.app = express();
    this.logger.info('App instance created ✅');

    this.loadMiddlewares();
    this.loadRoutes();
    this.initializeServices();
  }

  /** Load global app middlewares */
  private loadMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors({ origin: '*' }));
    this.app.use(json());
    this.logger.info('App middlewares loaded ✅');
  }

  /** Load app routes */
  private loadRoutes(): void {
    this.app.use('/api/coasters', rollercoasterRouter());
    this.logger.info('App routes loaded ✅');
  }

  /** Initialize all app services */
  public initializeServices(): void {
    Promise.all([
      this.redisClient.connect(),
      this.subManagerService.initSubscribers(),
      this.leaderManagerService.initLeadershipCheck(),
    ]);
    this.logger.info('App services loaded ✅');
  }
}

export default App;
