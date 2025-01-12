export const ContainerTypes = {
  App: Symbol.for('App'),
  Logger: Symbol.for('Logger'),
  RedisClient: Symbol.for('RedisClient'),
  JSONClient: Symbol.for('JSONClient'),
  CoasterController: Symbol.for('CoasterController'),
  JSONCoasterRepository: Symbol.for('JSONCoasterRepository'),
  RedisCoasterRepository: Symbol.for('RedisCoasterRepository'),
  CoasterService: Symbol.for('CoasterService'),
  LeaderManagerService: Symbol.for('LeaderManagerService'),
  RedisService: Symbol.for('RedisService'),
  SubManagerService: Symbol.for('SubManagerService'),
};

export type OperationType = 'addCoaster' | 'updateCoaster' | 'addWagon' | 'deleteWagon';
