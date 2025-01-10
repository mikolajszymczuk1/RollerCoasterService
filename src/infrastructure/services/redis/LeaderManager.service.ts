import { injectable, inject } from 'inversify';
import RedisClient from '@/infrastructure/database/redisClient';
import { ContainerTypes } from '@/types/common';
import { v4 as uuidv4 } from 'uuid';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';

@injectable()
class LeaderManagerService implements ILeaderManagerService {
  private readonly redisClient: RedisClient;
  private readonly leaderId: string;
  private readonly leaderKey: string = 'leader';
  private readonly leaderTTL: number = 4; // in seconds
  private readonly leaderCheckInterval: number = 2000; // in seconds

  private isLeader: boolean = false; // leader status

  constructor(@inject(ContainerTypes.RedisClient) redisClient: RedisClient) {
    this.redisClient = redisClient;
    this.leaderId = uuidv4();
  }

  /** Try to set leader status (set leader key with specific TTL) */
  private async tryToBecomeLeader(): Promise<void> {
    const result = await this.redisClient.redisClient.set(this.leaderKey, this.leaderId, {
      NX: true,
      EX: this.leaderTTL,
    });

    // this.isLeader = result === 'OK';

    // TODO: remove this block when logic will be tested
    if (result === 'OK') {
      this.isLeader = true;
      console.log(`[${this.leaderId}] został liderem.`);
    } else {
      this.isLeader = false;
    }
  }

  /** Try to refresh leader status, if it's not possible than set leader status to false */
  private async refreshLeaderShip(): Promise<void> {
    if (!this.isLeader) {
      return;
    }

    const currentLeaderId = await this.redisClient.redisClient.get(this.leaderKey);
    if (currentLeaderId === this.leaderId) {
      await this.redisClient.redisClient.expire(this.leaderKey, this.leaderTTL);
      console.log(`[${this.leaderId}] odświeżył TTL lidera`); // TODO: remove this line when logic will be tested
    } else {
      this.isLeader = false;
      console.log(`[${this.leaderId}] stracił status lidera`); // TODO: remove this line when logic will be tested
    }
  }

  /** Init leader status check logic */
  public initLeadershipCheck(): void {
    setInterval(async (): Promise<void> => {
      if (!this.isLeader) {
        await this.tryToBecomeLeader();
      } else {
        await this.refreshLeaderShip();
      }
    }, this.leaderCheckInterval);
  }
}

export default LeaderManagerService;
