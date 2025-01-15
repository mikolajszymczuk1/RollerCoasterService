import { injectable, inject } from 'inversify';
import type { IRedisCoasterRepository } from '@/domain/repositories/IRedisCoaster.repository';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';
import type { IRedisClient } from '@/domain/database/IRedis.client';
import { ContainerTypes } from '@/types/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@injectable()
class RedisCoasterRepository implements IRedisCoasterRepository {
  private readonly redisClient: IRedisClient;

  constructor(@inject(ContainerTypes.RedisClient) redisClient: IRedisClient) {
    this.redisClient = redisClient;
  }

  /**
   * Add new coaster
   * @param {Coaster} coasterToAdd coaster data to save
   * @returns {Promise<Coaster>} added coaster
   */
  public async addCoaster(coasterToAdd: Coaster): Promise<Coaster> {
    await this.redisClient.set(coasterToAdd.id, JSON.stringify(instanceToPlain(coasterToAdd)));
    return coasterToAdd;
  }

  /**
   * Update coaster data
   * @param {string} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data to save
   * @returns {Promise<Coaster>} updated coaster
   */
  public async updateCoaster(coasterId: string, newCoasterData: Coaster): Promise<Coaster> {
    await this.redisClient.set(coasterId, JSON.stringify(instanceToPlain(newCoasterData)));
    return newCoasterData;
  }

  /**
   * Add new wagon to coaster
   * @param {string} coasterId coaster id
   * @param {Wagon} wagonToAdd wagon data to add
   * @returns {Promise<Wagon>} added wagon
   */
  public async addWagon(coasterId: string, wagonToAdd: Wagon): Promise<Wagon> {
    const data = await this.redisClient.get(coasterId);
    const coaster = plainToInstance(Coaster, JSON.parse(data!) as Coaster);
    coaster.wagons.push(wagonToAdd);
    await this.redisClient.set(coasterId, JSON.stringify(instanceToPlain(coaster)));
    return wagonToAdd;
  }

  /**
   * Delete single wagon
   * @param {string} coasterId coaster id
   * @param {string} wagonId wagon id
   * @returns {Promise<Wagon>} deleted wagon
   */
  public async deleteWagon(coasterId: string, wagonId: string): Promise<Wagon> {
    const data = await this.redisClient.get(coasterId);
    const coaster = plainToInstance(Coaster, JSON.parse(data!) as Coaster);
    const wagonToDelete = coaster.wagons.find((wagon) => wagon.id === wagonId)!;
    coaster.wagons = coaster.wagons.filter((wagon) => wagon.id !== wagonId);
    await this.redisClient.set(coasterId, JSON.stringify(instanceToPlain(coaster)));
    return wagonToDelete;
  }

  /**
   * Get next coaster id based on redis central database
   * @returns {Promise<string>} new coaster id
   */
  public async nextCoasterId(): Promise<string> {
    const existNextId = await this.redisClient.get('coaster:id:next');
    if (!existNextId) {
      await this.redisClient.set('coaster:id:next', 'coaster:1');
      return 'coaster:1';
    }

    const [name, value] = existNextId.split(':');
    const nextId = `${name}:${parseInt(value) + 1}`;
    await this.redisClient.set('coaster:id:next', nextId);
    return nextId;
  }

  /**
   * Get next wagon id based on redis central database
   * @returns {Promise<string>} new wagon id
   */
  public async nextWagonId(): Promise<string> {
    const existNextId = await this.redisClient.get('wagon:id:next');
    if (!existNextId) {
      await this.redisClient.set('wagon:id:next', 'wagon:1');
      return 'wagon:1';
    }

    const [name, value] = existNextId.split(':');
    const nextId = `${name}:${parseInt(value) + 1}`;
    await this.redisClient.set('wagon:id:next', nextId);
    return nextId;
  }
}

export default RedisCoasterRepository;
