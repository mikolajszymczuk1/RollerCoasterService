import { injectable, inject } from 'inversify';
import type { IRedisService } from '@/domain/services/redis/IRedis.service';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';
import { ContainerTypes } from '@/types/common';
import type { ICoasterRepository } from '@/domain/repositories/ICoaster.repository';
import RedisClient from '@/infrastructure/database/redisClient';
import { instanceToPlain } from 'class-transformer';
import { RedisChannels } from '@/enums/RedisChannels';

@injectable()
class RedisService implements IRedisService {
  private readonly redisCoasterRepository: ICoasterRepository<Promise<Coaster | Wagon>>;
  private readonly redisClient: RedisClient;

  constructor(
    @inject(ContainerTypes.RedisCoasterRepository) redisCoasterRepository: ICoasterRepository<Promise<Coaster | Wagon>>,
    @inject(ContainerTypes.RedisClient) redisClient: RedisClient,
  ) {
    this.redisCoasterRepository = redisCoasterRepository;
    this.redisClient = redisClient;
  }

  /**
   * Add coaster in redis
   * @param {Coaster} coasterToAdd coaster to add
   * @returns {Promise<Coaster>} added coaster object
   */
  public async addCoaster(coasterToAdd: Coaster): Promise<Coaster> {
    return (await this.redisCoasterRepository.addCoaster(coasterToAdd)) as Coaster;
  }

  /**
   * Update coaster in redis
   * @param {string} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data
   * @returns {Promise<Coaster>} updated coaster object
   */
  public async updateCoaster(coasterId: string, newCoasterData: Coaster): Promise<Coaster> {
    return (await this.redisCoasterRepository.updateCoaster(coasterId, newCoasterData)) as Coaster;
  }

  /**
   * Add wagon to coaster in redis
   * @param {string} coasterId coaster id
   * @param {Wagon} wagonToAdd wagon to add
   * @returns {Promise<Wagon>} added wagon object
   */
  public async addWagon(coasterId: string, wagonToAdd: Wagon): Promise<Wagon> {
    return (await this.redisCoasterRepository.addWagon(coasterId, wagonToAdd)) as Wagon;
  }

  /**
   * Delete wagon from coaster in redis
   * @param {string} coasterId coaster id
   * @param {string} wagonId wagon id
   * @returns {Promise<Wagon>} deleted wagon object
   */
  public async deleteWagon(coasterId: string, wagonId: string): Promise<Wagon> {
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
  public async addCoasterPublish(coasterToAdd: Coaster, isSync: boolean, nodeId: string): Promise<void> {
    await this.redisClient.publish(
      isSync ? RedisChannels.SYNCHRONIZE_COASTER_ADD : RedisChannels.COASTER_ADD,
      JSON.stringify({ nodeId, data: instanceToPlain(coasterToAdd) }),
    );
  }

  /**
   * Publish update coaster message
   * @param {string} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data
   */
  public async updateCoasterPublish(
    coasterId: string,
    newCoasterData: Coaster,
    isSync: boolean,
    nodeId: string,
  ): Promise<void> {
    await this.redisClient.publish(
      isSync ? RedisChannels.SYNCHRONIZE_COASTER_UPDATE : RedisChannels.COASTER_UPDATE,
      JSON.stringify({ nodeId, coasterId, data: instanceToPlain(newCoasterData) }),
    );
  }

  /**
   * Publish add wagon message
   * @param {string} coasterId coaster id
   * @param {Wagon} wagonToAdd wagon to add
   */
  public async addWagonPublish(coasterId: string, wagonToAdd: Wagon, isSync: boolean, nodeId: string): Promise<void> {
    await this.redisClient.publish(
      isSync ? RedisChannels.SYNCHRONIZE_WAGON_ADD : RedisChannels.WAGON_ADD,
      JSON.stringify({ nodeId, coasterId, data: instanceToPlain(wagonToAdd) }),
    );
  }

  /**
   * Publish delete wagon message
   * @param {string} coasterId coaster id
   * @param {string} wagonId wagon id
   */
  public async deleteWagonPublish(coasterId: string, wagonId: string, isSync: boolean, nodeId: string): Promise<void> {
    await this.redisClient.publish(
      isSync ? RedisChannels.SYNCHRONIZE_WAGON_REMOVE : RedisChannels.WAGON_REMOVE,
      JSON.stringify({ nodeId, coasterId, wagonId }),
    );
  }
}

export default RedisService;
