import type { RedisClientType } from 'redis';

export interface IRedisClient {
  get redisClient(): RedisClientType;
  get redisPublisher(): RedisClientType;
  get redisSubscriber(): RedisClientType;
  connect(): Promise<void>;
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  publish(channel: string, message: string): Promise<void>;
  subscribe(channel: string, callback: (message: string) => void): Promise<void>;
}
