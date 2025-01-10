import { Container } from 'inversify';
import { ContainerTypes } from '@/types/common';
import Logger from '@/infrastructure/logger';
import App from '@/app';
import RedisClient from '@/infrastructure/database/redisClient';
import JSONClient from '@/infrastructure/database/jsonClient';
import CoasterController from '@/app/controllers/Coaster.controller';
import type { ICoasterRepository } from '@/domain/repositories/ICoaster.repository';
import JSONCoasterRepository from '@/infrastructure/repositories/JSONCoaster.repository';
import RedisCoasterRepository from '@/infrastructure/repositories/RedisCoaster.repository';
import type { ICoasterService } from '@/domain/services/ICoaster.service';
import CoasterService from '@/infrastructure/services/Coaster.service';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';
import LeaderManagerService from '@/infrastructure/services/redis/LeaderManager.service';

const container = new Container();

container.bind<App>(ContainerTypes.App).to(App);

container.bind<Logger>(ContainerTypes.Logger).to(Logger).inSingletonScope();

container.bind<RedisClient>(ContainerTypes.RedisClient).to(RedisClient).inSingletonScope();

container.bind<JSONClient>(ContainerTypes.JSONClient).to(JSONClient).inSingletonScope();

container.bind<CoasterController>(ContainerTypes.CoasterController).to(CoasterController);

container.bind<ICoasterRepository>(ContainerTypes.JSONCoasterRepository).to(JSONCoasterRepository);

container.bind<ICoasterRepository>(ContainerTypes.RedisCoasterRepository).to(RedisCoasterRepository);

container.bind<ICoasterService>(ContainerTypes.CoasterService).to(CoasterService);

container.bind<ILeaderManagerService>(ContainerTypes.LeaderManager).to(LeaderManagerService).inSingletonScope();

export { container };
