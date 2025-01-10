import 'reflect-metadata';
import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { json } from 'body-parser';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '@/types/common';
import Logger from '@/infrastructure/logger';
import RedisClient from '@/infrastructure/database/redisClient';
import rollercoasterRouter from '@/app/routes/rollercoaster.router';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';

@injectable()
export class App {
  private readonly logger: Logger;
  private readonly redisClient: RedisClient;
  private readonly leaderManagerService: ILeaderManagerService;

  public app: Application;

  constructor(
    @inject(ContainerTypes.Logger) logger: Logger,
    @inject(ContainerTypes.RedisClient) redisClient: RedisClient,
    @inject(ContainerTypes.LeaderManager) leaderManagerService: ILeaderManagerService,
  ) {
    this.logger = logger;
    this.redisClient = redisClient;
    this.leaderManagerService = leaderManagerService;
    this.app = express();
    this.logger.info('App instance created ✅');

    this.loadMiddlewares();
    this.loadRoutes();
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
  public async initializeServices(): Promise<void> {
    await this.redisClient.connect();
    this.leaderManagerService.initLeadershipCheck();
    this.logger.info('App services loaded ✅');
  }
}

export default App;
