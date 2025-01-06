import 'reflect-metadata';
import express, { type Application } from 'express';
import { injectable, inject } from 'inversify';
import { ContainerTypes } from '@/types/common';
import Logger from '@/infrastructure/logger';

@injectable()
export class App {
  private readonly logger: Logger;

  public app: Application;

  constructor(@inject(ContainerTypes.Logger) logger: Logger) {
    this.logger = logger;
    this.app = express();
    this.logger.info('App instance created');
  }
}

export default App;
