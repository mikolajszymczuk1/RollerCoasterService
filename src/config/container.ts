import { Container } from 'inversify';
import Logger from '@/infrastructure/logger';
import App from '@/app';
import RedisClient from '@/infrastructure/database/redisClient';
import { ContainerTypes } from '@/types/common';

const container = new Container();

container.bind<Logger>(ContainerTypes.Logger).to(Logger).inSingletonScope();

container.bind<App>(ContainerTypes.App).to(App);

container.bind<RedisClient>(ContainerTypes.RedisClient).to(RedisClient).inSingletonScope();

export { container };
