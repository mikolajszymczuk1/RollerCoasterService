import { injectable, inject } from 'inversify';
import { createClient, type RedisClientType } from 'redis';
import Logger from '@/infrastructure/logger';
import { ContainerTypes } from '@/types/common';

@injectable()
class RedisClient {
  private readonly client: RedisClientType;
  private readonly logger: Logger;

  constructor(@inject(ContainerTypes.Logger) logger: Logger) {
    this.client = createClient({
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
      database: Number(process.env.DATABASE ?? 0),
    });
    this.logger = logger;

    this.client.on('error', (err) => {
      this.logger.error(`Redis client error: ${err}`);
    });
  }

  /** Get redis client */
  public getClient(): RedisClientType {
    return this.client;
  }

  /** Connect to redis service */
  public async connect(): Promise<void> {
    await this.client.connect();
  }

  /** Disconnect from redis service */
  public async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}

export default RedisClient;
