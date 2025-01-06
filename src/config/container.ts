import { Container } from 'inversify';
import Logger from '@/infrastructure/logger';
import App from '@/app';
import { ContainerTypes } from '@/types/common';

const container = new Container();

container.bind<Logger>(ContainerTypes.Logger).to(Logger).inSingletonScope();

container.bind<App>(ContainerTypes.App).to(App);

export { container };
