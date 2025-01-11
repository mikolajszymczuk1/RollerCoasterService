import { injectable, inject } from 'inversify';
import { ICoasterRepository } from '@/domain/repositories/ICoaster.repository';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';
import RedisClient from '@/infrastructure/database/redisClient';
import { ContainerTypes } from '@/types/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@injectable()
class RedisCoasterRepository implements ICoasterRepository<Promise<Coaster | Wagon>> {
  private readonly redisClient: RedisClient;

  constructor(@inject(ContainerTypes.RedisClient) redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  /**
   * Add new coaster
   * @param {Coaster} coasterToAdd coaster data to save
   * @returns {Promise<Coaster>} added coaster
   */
  public async addCoaster(coasterToAdd: Coaster): Promise<Coaster> {
    await this.redisClient.set(`coaster:${coasterToAdd.id}`, JSON.stringify(instanceToPlain(coasterToAdd)));
    return coasterToAdd;
  }

  /**
   * Update coaster data
   * @param {number} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data to save
   * @returns {Promise<Coaster>} updated coaster
   */
  public async updateCoaster(coasterId: number, newCoasterData: Coaster): Promise<Coaster> {
    await this.redisClient.set(`coaster:${coasterId}`, JSON.stringify(instanceToPlain(newCoasterData)));
    return newCoasterData;
  }

  /**
   * Add new wagon to coaster
   * @param {number} coasterId coaster id
   * @param {Wagon} wagonToAdd wagon data to add
   * @returns {Promise<Wagon>} added wagon
   */
  public async addWagon(coasterId: number, wagonToAdd: Wagon): Promise<Wagon> {
    const data = await this.redisClient.get(`coaster:${coasterId}`);
    const coaster = plainToInstance(Coaster, JSON.parse(data!) as Coaster);
    coaster.wagons.push(wagonToAdd);
    await this.redisClient.set(`coaster:${coasterId}`, JSON.stringify(instanceToPlain(coaster)));
    return wagonToAdd;
  }

  /**
   * Delete single wagon
   * @param {number} coasterId coaster id
   * @param {number} wagonId wagon id
   * @returns {Promise<Wagon>} deleted wagon
   */
  public async deleteWagon(coasterId: number, wagonId: number): Promise<Wagon> {
    const data = await this.redisClient.get(`coaster:${coasterId}`);
    const coaster = plainToInstance(Coaster, JSON.parse(data!) as Coaster);
    const wagonToDelete = coaster.wagons.find((wagon) => wagon.id === wagonId)!;
    coaster.wagons = coaster.wagons.filter((wagon) => wagon.id !== wagonId);
    await this.redisClient.set(`coaster:${coasterId}`, JSON.stringify(instanceToPlain(coaster)));
    return wagonToDelete;
  }
}

export default RedisCoasterRepository;
