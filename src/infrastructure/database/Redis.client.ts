import { injectable, inject } from 'inversify';
import { createClient, type RedisClientType } from 'redis';
import type { ILoggerService } from '@/domain/services/ILogger.service';
import { ContainerTypes } from '@/types/common';
import type { IRedisClient } from '@/domain/database/IRedis.client';

@injectable()
class RedisClient implements IRedisClient {
  private readonly client: RedisClientType;
  private readonly publisher: RedisClientType;
  private readonly subscriber: RedisClientType;
  private readonly logger: ILoggerService;

  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;

  constructor(@inject(ContainerTypes.Logger) logger: ILoggerService) {
    const redisClientOptions = {
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
      database: Number(process.env.DATABASE ?? 0),
      socket: {
        reconnectStrategy: () => 1000,
        timeout: 1000,
        connectTimeout: 1000,
      },
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

  public get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Setup event listeners for single redis client instance
   * @param {RedisClientType} client type of client
   * @param {string} label name of redis client instance
   * @param {RedisClientType} nextClient client that should be trigger to next connect process
   */
  private setupListeners(client: RedisClientType, label: string, nextClient?: RedisClientType): void {
    client.on('connect', async (): Promise<void> => {
      this.logger.info(`[${label}] Connected to Redis`);
      this.reconnectAttempts = 0;
      if (nextClient) {
        await nextClient.connect();
      } else {
        this.isConnected = true;
      }
    });

    client.on('error', async (err): Promise<void> => {
      this.logger.error(`[${label}] Redis client error: ${err}`);
      this.isConnected = false;
      await this.handleConnectionError('Client');
    });

    client.on('end', (): void => {
      this.logger.warn(`[${label}] Closed connection`);
      this.isConnected = false;
    });
  }

  /** Set all redis events to listen */
  private initRedisEvents(): void {
    this.setupListeners(this.client, 'Client', this.publisher);
    this.setupListeners(this.publisher, 'Publisher', this.subscriber);
    this.setupListeners(this.subscriber, 'Subscriber');
  }

  /**
   * Handle connection error, if max reconnect attempts then restart all connections
   * @param {string} label name of redis client instance
   */
  private async handleConnectionError(label: string): Promise<void> {
    this.logger.warn(`[${label}] Attempting to reconnect...`);

    // Increment reconnect attempts
    this.reconnectAttempts++;

    if (this.reconnectAttempts >= 2) {
      this.logger.error(`[${label}] Max reconnect attempts reached. Restarting connections`);
      this.reconnectAttempts = 0;
      await this.restartConnections();
    }
  }

  /** Restart all redis connections and rerun connection process */
  private async restartConnections(): Promise<void> {
    this.logger.warn('Restarting all Redis connections ...');

    await Promise.allSettled([
      this.client.disconnect().catch(() => {}),
      this.publisher.isOpen ? this.publisher.disconnect().catch(() => {}) : Promise.resolve(),
      this.subscriber.isOpen ? this.subscriber.disconnect().catch(() => {}) : Promise.resolve(),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await this.connect();
  }

  /** Connect to redis service */
  public async connect(): Promise<void> {
    await this.client.connect();
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
