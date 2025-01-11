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

  private async addCoaster(coasterToAdd: Coaster): Promise<Coaster> {
    return (await this.redisCoasterRepository.addCoaster(coasterToAdd)) as Coaster;
  }

  private async updateCoaster(coasterId: number, newCoasterData: Coaster): Promise<Coaster> {
    return (await this.redisCoasterRepository.updateCoaster(coasterId, newCoasterData)) as Coaster;
  }

  private async addWagon(coasterId: number, wagonToAdd: Wagon): Promise<Wagon> {
    return (await this.redisCoasterRepository.addWagon(coasterId, wagonToAdd)) as Wagon;
  }

  private async deleteWagon(coasterId: number, wagonId: number): Promise<Wagon> {
    return (await this.redisCoasterRepository.deleteWagon(coasterId, wagonId)) as Wagon;
  }

  public async addCoasterPublish(coasterToAdd: Coaster): Promise<void> {
    await this.redisClient.publish(RedisChannels.COASTER_ADD, JSON.stringify(instanceToPlain(coasterToAdd)));
  }

  public async updateCoasterPublish(coasterId: number, newCoasterData: Coaster): Promise<void> {
    await this.redisClient.publish(
      RedisChannels.COASTER_UPDATE,
      JSON.stringify({ coasterId, data: instanceToPlain(newCoasterData) }),
    );
  }

  public async addWagonPublish(coasterId: number, wagonToAdd: Wagon): Promise<void> {
    await this.redisClient.publish(
      RedisChannels.WAGON_ADD,
      JSON.stringify({ coasterId, data: instanceToPlain(wagonToAdd) }),
    );
  }

  public async deleteWagonPublish(coasterId: number, wagonId: number): Promise<void> {
    await this.redisClient.publish(RedisChannels.WAGON_REMOVE, JSON.stringify({ coasterId, wagonId }));
  }

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
