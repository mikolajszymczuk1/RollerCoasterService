import { injectable, inject } from 'inversify';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';
import type { IRedisService } from '@/domain/services/redis/IRedis.service';
import type { ISubManagerService } from '@/domain/services/redis/ISubManager.service';
import type { ICoasterService } from '@/domain/services/ICoaster.service';
import RedisClient from '@/infrastructure/database/redisClient';
import Logger from '@/infrastructure/logger';
import { RedisChannels } from '@/enums/RedisChannels';
import { ContainerTypes } from '@/types/common';
import { plainToInstance } from 'class-transformer';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

@injectable()
class SubManagerService implements ISubManagerService {
  private readonly logger: Logger;
  private readonly redisClient: RedisClient;
  private readonly leaderManagerService: ILeaderManagerService;
  private readonly redisService: IRedisService;
  private readonly coasterService: ICoasterService;

  constructor(
    @inject(ContainerTypes.Logger) logger: Logger,
    @inject(ContainerTypes.RedisClient) redisClient: RedisClient,
    @inject(ContainerTypes.LeaderManagerService) leaderManagerService: ILeaderManagerService,
    @inject(ContainerTypes.RedisService) redisService: IRedisService,
    @inject(ContainerTypes.CoasterService) coasterService: ICoasterService,
  ) {
    this.logger = logger;
    this.redisClient = redisClient;
    this.leaderManagerService = leaderManagerService;
    this.redisService = redisService;
    this.coasterService = coasterService;
  }

  /** Setup all service subscribers */
  public async initSubscribers(): Promise<void> {
    /** Leader subscribers */
    /** -------------------------------------------- */

    await this.redisClient.subscribe(RedisChannels.COASTER_ADD, async (message: string): Promise<void> => {
      if (!this.leaderManagerService.leaderStatus) {
        return;
      }

      try {
        const obj = JSON.parse(message);
        const coaster = plainToInstance(Coaster, obj.data as Coaster);
        await this.redisService.addCoaster(coaster);
        await this.redisService.addCoasterPublish(coaster, true, obj.nodeId);
      } catch (err) {
        this.logger.error(`Redis operation error [${RedisChannels.COASTER_ADD}]: ${err}`);
      }
    });

    await this.redisClient.subscribe(RedisChannels.COASTER_UPDATE, async (message: string): Promise<void> => {
      if (!this.leaderManagerService.leaderStatus) {
        return;
      }

      try {
        const obj = JSON.parse(message);
        const coaster = plainToInstance(Coaster, obj.data as Coaster);
        await this.redisService.updateCoaster(obj.coasterId, coaster);
        await this.redisService.updateCoasterPublish(obj.coasterId, coaster, true, obj.nodeId);
      } catch (err) {
        this.logger.error(`Redis operation error [${RedisChannels.COASTER_UPDATE}]: ${err}`);
      }
    });

    await this.redisClient.subscribe(RedisChannels.WAGON_ADD, async (message: string): Promise<void> => {
      if (!this.leaderManagerService.leaderStatus) {
        return;
      }

      try {
        const obj = JSON.parse(message);
        const wagon = plainToInstance(Wagon, obj.data as Wagon);
        await this.redisService.addWagon(obj.coasterId, wagon);
        await this.redisService.addWagonPublish(obj.coasterId, wagon, true, obj.nodeId);
      } catch (err) {
        this.logger.error(`Redis operation error [${RedisChannels.WAGON_ADD}]: ${err}`);
      }
    });

    await this.redisClient.subscribe(RedisChannels.WAGON_REMOVE, async (message: string): Promise<void> => {
      if (!this.leaderManagerService.leaderStatus) {
        return;
      }

      try {
        const obj = JSON.parse(message);
        await this.redisService.deleteWagon(obj.coasterId, obj.wagonId);
        await this.redisService.deleteWagonPublish(obj.coasterId, obj.wagonId, true, obj.nodeId);
      } catch (err) {
        this.logger.error(`Redis operation error [${RedisChannels.WAGON_REMOVE}]: ${err}`);
      }
    });

    /** Normal node subscribers */
    /** -------------------------------------------- */

    await this.redisClient.subscribe(RedisChannels.SYNCHRONIZE_COASTER_ADD, async (message: string): Promise<void> => {
      try {
        const obj = JSON.parse(message);
        if (obj.nodeId === this.leaderManagerService.id) {
          return;
        }

        const coaster = plainToInstance(Coaster, obj.data as Coaster);
        this.coasterService.addCoaster(coaster);
      } catch (err) {
        this.logger.error(`Redis operation error [${RedisChannels.SYNCHRONIZE_COASTER_ADD}]: ${err}`);
      }
    });

    await this.redisClient.subscribe(
      RedisChannels.SYNCHRONIZE_COASTER_UPDATE,
      async (message: string): Promise<void> => {
        try {
          const obj = JSON.parse(message);
          if (obj.nodeId === this.leaderManagerService.id) {
            return;
          }

          const coaster = plainToInstance(Coaster, obj.data as Coaster);
          this.coasterService.updateCoaster(obj.coasterId, coaster);
        } catch (err) {
          this.logger.error(`Redis operation error [${RedisChannels.SYNCHRONIZE_COASTER_UPDATE}]: ${err}`);
        }
      },
    );

    await this.redisClient.subscribe(RedisChannels.SYNCHRONIZE_WAGON_ADD, async (message: string): Promise<void> => {
      try {
        const obj = JSON.parse(message);
        if (obj.nodeId === this.leaderManagerService.id) {
          return;
        }

        const wagon = plainToInstance(Wagon, obj.data as Wagon);
        this.coasterService.addWagon(obj.coasterId, wagon);
      } catch (err) {
        this.logger.error(`Redis operation error [${RedisChannels.SYNCHRONIZE_WAGON_ADD}]: ${err}`);
      }
    });

    await this.redisClient.subscribe(RedisChannels.SYNCHRONIZE_WAGON_REMOVE, async (message: string): Promise<void> => {
      try {
        const obj = JSON.parse(message);
        if (obj.nodeId === this.leaderManagerService.id) {
          return;
        }

        this.coasterService.deleteWagon(obj.coasterId, obj.wagonId);
      } catch (err) {
        this.logger.error(`Redis operation error [${RedisChannels.SYNCHRONIZE_WAGON_REMOVE}]: ${err}`);
      }
    });
  }
}

export default SubManagerService;
