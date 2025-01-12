import { injectable, inject } from 'inversify';
import { createClient, type RedisClientType } from 'redis';
import Logger from '@/infrastructure/logger';
import { ContainerTypes } from '@/types/common';

@injectable()
class RedisClient {
  private readonly client: RedisClientType;
  private readonly publisher: RedisClientType;
  private readonly subscriber: RedisClientType;
  private readonly logger: Logger;

  constructor(@inject(ContainerTypes.Logger) logger: Logger) {
    const redisClientOptions = {
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
      database: Number(process.env.DATABASE ?? 0),
    };

    this.client = createClient(redisClientOptions);
    this.publisher = createClient(redisClientOptions);
    this.subscriber = createClient(redisClientOptions);

    this.logger = logger;

    this.initRedisEvents();
  }

  /** Get redis client */
  public get redisClient(): RedisClientType {
    return this.client;
  }

  public get redisPublisher(): RedisClientType {
    return this.publisher;
  }

  public get redisSubscriber(): RedisClientType {
    return this.subscriber;
  }

  /** Set all redis events to listen */
  private initRedisEvents(): void {
    this.client.on('connect', (): void => {
      this.logger.info('Connected to Redis');
    });

    this.client.on('reconnecting', (): void => {
      this.logger.warn('Reconnect to Redis');
    });

    this.client.on('error', (err): void => {
      this.logger.error(`Redis client error: ${err}`);
    });
  }

  /** Connect to redis service */
  public async connect(): Promise<void> {
    await this.client.connect();
    await this.publisher.connect();
    await this.subscriber.connect();
  }

  /** Disconnect from redis service */
  public async disconnect(): Promise<void> {
    await this.client.disconnect();
    await this.publisher.disconnect();
    await this.subscriber.disconnect();
  }

  /**
   * Set key in redis
   * @param {string} key key name
   * @param {string} value key value to set
   */
  public async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  /**
   * Get key value from redis
   * @param {string} key key to get
   * @returns {Promise<string | null>} key value
   */
  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Publish some message on specific channel
   * @param {string} channel channel that message is send to
   * @param {string} message message to send
   */
  public async publish(channel: string, message: string): Promise<void> {
    await this.publisher.publish(channel, message);
  }

  /**
   * Subscribe to specific channel and call provided callback function on new messages
   * @param {string} channel channel to subscribe to
   * @param {Function} callback callback function to call when new message is received
   */
  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel, callback);
  }
}

export default RedisClient;
