export enum RedisChannels {
  COASTER_ADD = 'coaster:add',
  COASTER_UPDATE = 'coaster:update',
  WAGON_ADD = 'wagon:add',
  WAGON_REMOVE = 'wagon:remove',

  SYNCHRONIZE_COASTER_ADD = 'synchronize:coaster:add',
  SYNCHRONIZE_COASTER_UPDATE = 'synchronize:coaster:update',
  SYNCHRONIZE_WAGON_ADD = 'synchronize:wagon:add',
  SYNCHRONIZE_WAGON_REMOVE = 'synchronize:wagon:remove',
}
