import { injectable, inject } from 'inversify';
import type { IRedisService } from '@/domain/services/redis/IRedis.service';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';
import { ContainerTypes } from '@/types/common';
import type { ICoasterRepository } from '@/domain/repositories/ICoaster.repository';
import RedisClient from '@/infrastructure/database/redisClient';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';
import Logger from '@/infrastructure/logger';
import { RedisChannels } from '@/enums/RedisChannels';

@injectable()
class RedisService implements IRedisService {
  private readonly logger: Logger;
  private readonly redisCoasterRepository: ICoasterRepository<Promise<Coaster | Wagon>>;
  private readonly redisClient: RedisClient;
  private readonly leaderManagerService: ILeaderManagerService;

  constructor(
    @inject(ContainerTypes.Logger) logger: Logger,
    @inject(ContainerTypes.RedisCoasterRepository) redisCoasterRepository: ICoasterRepository<Promise<Coaster | Wagon>>,
    @inject(ContainerTypes.RedisClient) redisClient: RedisClient,
    @inject(ContainerTypes.LeaderManagerService) leaderManagerService: ILeaderManagerService,
  ) {
    this.logger = logger;
    this.redisCoasterRepository = redisCoasterRepository;
    this.redisClient = redisClient;
    this.leaderManagerService = leaderManagerService;
  }

  /**
   * Add coaster in redis
   * @param {Coaster} coasterToAdd coaster to add
   * @returns {Promise<Coaster>} added coaster object
   */
  private async addCoaster(coasterToAdd: Coaster): Promise<Coaster> {
    return (await this.redisCoasterRepository.addCoaster(coasterToAdd)) as Coaster;
  }

  /**
   * Update coaster in redis
   * @param {string} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data
   * @returns {Promise<Coaster>} updated coaster object
   */
  private async updateCoaster(coasterId: string, newCoasterData: Coaster): Promise<Coaster> {
    return (await this.redisCoasterRepository.updateCoaster(coasterId, newCoasterData)) as Coaster;
  }

  /**
   * Add wagon to coaster in redis
   * @param {string} coasterId coaster id
   * @param {Wagon} wagonToAdd wagon to add
   * @returns {Promise<Wagon>} added wagon object
   */
  private async addWagon(coasterId: string, wagonToAdd: Wagon): Promise<Wagon> {
    return (await this.redisCoasterRepository.addWagon(coasterId, wagonToAdd)) as Wagon;
  }

  /**
   * Delete wagon from coaster in redis
   * @param {string} coasterId coaster id
   * @param {string} wagonId wagon id
   * @returns {Promise<Wagon>} deleted wagon object
   */
  private async deleteWagon(coasterId: string, wagonId: string): Promise<Wagon> {
    return (await this.redisCoasterRepository.deleteWagon(coasterId, wagonId)) as Wagon;
  }

  /**
   * Get next coaster id based on redis central database
   * @returns {Promise<string>} new coaster id
   */
  public async nextCoasterId(): Promise<string> {
    return await this.redisCoasterRepository.nextCoasterId();
  }

  /**
   * Get next wagon id based on redis central database
   * @returns {Promise<string>} new wagon id
   */
  public async nextWagonId(): Promise<string> {
    return await this.redisCoasterRepository.nextWagonId();
  }

  /**
   * Publish add coaster message
   * @param {Coaster} coasterToAdd coaster to add
   */
  public async addCoasterPublish(coasterToAdd: Coaster): Promise<void> {
    await this.redisClient.publish(RedisChannels.COASTER_ADD, JSON.stringify(instanceToPlain(coasterToAdd)));
  }

  /**
   * Publish update coaster message
   * @param {string} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data
   */
  public async updateCoasterPublish(coasterId: string, newCoasterData: Coaster): Promise<void> {
    await this.redisClient.publish(
      RedisChannels.COASTER_UPDATE,
      JSON.stringify({ coasterId, data: instanceToPlain(newCoasterData) }),
    );
  }

  /**
   * Publish add wagon message
   * @param {string} coasterId coaster id
   * @param {Wagon} wagonToAdd wagon to add
   */
  public async addWagonPublish(coasterId: string, wagonToAdd: Wagon): Promise<void> {
    await this.redisClient.publish(
      RedisChannels.WAGON_ADD,
      JSON.stringify({ coasterId, data: instanceToPlain(wagonToAdd) }),
    );
  }

  /**
   * Publish delete wagon message
   * @param {string} coasterId coaster id
   * @param {string} wagonId wagon id
   */
  public async deleteWagonPublish(coasterId: string, wagonId: string): Promise<void> {
    await this.redisClient.publish(RedisChannels.WAGON_REMOVE, JSON.stringify({ coasterId, wagonId }));
  }

  /** Setup all service subscribers */
  public async initSubscribers(): Promise<void> {
    await this.redisClient.subscribe(RedisChannels.COASTER_ADD, async (message: string): Promise<void> => {
      if (this.leaderManagerService.leaderStatus) {
        try {
          const coaster = plainToInstance(Coaster, JSON.parse(message) as Coaster);
          await this.addCoaster(coaster);
        } catch (err) {
          this.logger.error(`Redis operation error [${RedisChannels.COASTER_ADD}]: ${err}`);
        }
      }
    });

    await this.redisClient.subscribe(RedisChannels.COASTER_UPDATE, async (message: string): Promise<void> => {
      if (this.leaderManagerService.leaderStatus) {
        try {
          const obj = JSON.parse(message);
          const coaster = plainToInstance(Coaster, obj.data as Coaster);
          await this.updateCoaster(obj.coasterId, coaster);
        } catch (err) {
          this.logger.error(`Redis operation error [${RedisChannels.COASTER_UPDATE}]: ${err}`);
        }
      }
    });

    await this.redisClient.subscribe(RedisChannels.WAGON_ADD, async (message: string): Promise<void> => {
      if (this.leaderManagerService.leaderStatus) {
        try {
          const obj = JSON.parse(message);
          const wagon = plainToInstance(Wagon, obj.data as Wagon);
          await this.addWagon(obj.coasterId, wagon);
        } catch (err) {
          this.logger.error(`Redis operation error [${RedisChannels.WAGON_ADD}]: ${err}`);
        }
      }
    });

    await this.redisClient.subscribe(RedisChannels.WAGON_REMOVE, async (message: string): Promise<void> => {
      if (this.leaderManagerService.leaderStatus) {
        try {
          const obj = JSON.parse(message);
          await this.deleteWagon(obj.coasterId, obj.wagonId);
        } catch (err) {
          this.logger.error(`Redis operation error [${RedisChannels.WAGON_REMOVE}]: ${err}`);
        }
      }
    });
  }
}

export default RedisService;
