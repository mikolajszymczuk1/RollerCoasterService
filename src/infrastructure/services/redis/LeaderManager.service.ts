import { injectable, inject } from 'inversify';
import type { IRedisClient } from '@/domain/database/IRedis.client';
import { ContainerTypes } from '@/types/common';
import { v4 as uuidv4 } from 'uuid';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';
import type { ILoggerService } from '@/domain/services/ILogger.service';

@injectable()
class LeaderManagerService implements ILeaderManagerService {
  private readonly logger: ILoggerService;
  private readonly redisClient: IRedisClient;
  private readonly leaderId: string;
  private readonly leaderKey: string = 'leader';
  private readonly leaderTTL: number = 2; // in seconds
  private readonly leaderCheckInterval: number = 1000; // in seconds

  private isLeader: boolean = false; // leader status

  constructor(
    @inject(ContainerTypes.Logger) logger: ILoggerService,
    @inject(ContainerTypes.RedisClient) redisClient: IRedisClient,
  ) {
    this.logger = logger;
    this.redisClient = redisClient;
    this.leaderId = uuidv4();
  }

  public get leaderStatus(): boolean {
    return this.isLeader;
  }

  public get id(): string {
    return this.leaderId;
  }

  /** Try to set leader status (set leader key with specific TTL) */
  private async tryToBecomeLeader(): Promise<void> {
    try {
      const result = await this.redisClient.redisClient.set(this.leaderKey, this.leaderId, {
        NX: true,
        EX: this.leaderTTL,
      });

      this.isLeader = result === 'OK';

      if (this.isLeader) {
        this.logger.info('Leader set');
      }
    } catch (err) {
      this.logger.error(`Redis error: ${err}`);
    }
  }

  /** Try to refresh leader status, if it's not possible than set leader status to false */
  private async refreshLeaderShip(): Promise<void> {
    if (!this.isLeader) {
      return;
    }

    try {
      const currentLeaderId = await this.redisClient.redisClient.get(this.leaderKey);
      if (currentLeaderId === this.leaderId) {
        await this.redisClient.redisClient.expire(this.leaderKey, this.leaderTTL);
      } else {
        this.isLeader = false;
      }
    } catch (err) {
      this.logger.error(`Redis error: ${err}`);
    }
  }

  /** Init leader status check logic */
  public async initLeadershipCheck(): Promise<void> {
    if (!this.isLeader) {
      await this.tryToBecomeLeader();
    }

    setInterval(async (): Promise<void> => {
      if (!this.redisClient.connected) {
        return;
      }

      if (!this.isLeader) {
        await this.tryToBecomeLeader();
      } else {
        await this.refreshLeaderShip();
      }
    }, this.leaderCheckInterval);
  }
}

export default LeaderManagerService;
