import { Container } from 'inversify';
import { ContainerTypes } from '@/types/common';
import App from '@/app';
import CoasterController from '@/app/controllers/Coaster.controller';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';
import type { ILoggerService } from '@/domain/services/ILogger.service';
import Logger from '@/infrastructure/Logger.service';
import type { IRedisClient } from '@/domain/database/IRedis.client';
import RedisClient from '@/infrastructure/database/Redis.client';
import type { IJSONClient } from '@/domain/database/IJSON.client';
import JSONClient from '@/infrastructure/database/JSON.client';
import type { ICoasterRepository } from '@/domain/repositories/ICoaster.repository';
import JSONCoasterRepository from '@/infrastructure/repositories/JSONCoaster.repository';
import RedisCoasterRepository from '@/infrastructure/repositories/RedisCoaster.repository';
import type { ICoasterService } from '@/domain/services/ICoaster.service';
import CoasterService from '@/infrastructure/services/Coaster.service';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';
import LeaderManagerService from '@/infrastructure/services/redis/LeaderManager.service';
import type { IRedisService } from '@/domain/services/redis/IRedis.service';
import RedisService from '@/infrastructure/services/redis/Redis.service';
import type { ISubManagerService } from '@/domain/services/redis/ISubManager.service';
import SubManagerService from '@/infrastructure/services/redis/SubManager.service';

const container = new Container();

container.bind<App>(ContainerTypes.App).to(App);

container.bind<ILoggerService>(ContainerTypes.Logger).to(Logger).inSingletonScope();

container.bind<IRedisClient>(ContainerTypes.RedisClient).to(RedisClient).inSingletonScope();

container.bind<IJSONClient>(ContainerTypes.JSONClient).to(JSONClient).inSingletonScope();

container.bind<CoasterController>(ContainerTypes.CoasterController).to(CoasterController);

container.bind<ICoasterRepository<Coaster | Wagon>>(ContainerTypes.JSONCoasterRepository).to(JSONCoasterRepository);

container
  .bind<ICoasterRepository<Promise<Coaster | Wagon>>>(ContainerTypes.RedisCoasterRepository)
  .to(RedisCoasterRepository);

container.bind<ICoasterService>(ContainerTypes.CoasterService).to(CoasterService);

container.bind<ILeaderManagerService>(ContainerTypes.LeaderManagerService).to(LeaderManagerService).inSingletonScope();

container.bind<IRedisService>(ContainerTypes.RedisService).to(RedisService);

container.bind<ISubManagerService>(ContainerTypes.SubManagerService).to(SubManagerService);

export { container };
