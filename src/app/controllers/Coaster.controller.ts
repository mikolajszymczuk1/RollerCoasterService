import { injectable, inject } from 'inversify';
import { instanceToPlain } from 'class-transformer';
import type { Request, Response } from 'express';
import type { ICoasterService } from '@/domain/services/ICoaster.service';
import { ContainerTypes } from '@/types/common';
import type { ILoggerService } from '@/domain/services/ILogger.service';
import { ResponseCodes } from '@/app/enums/ResponseCodes';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';
import type { IRedisService } from '@/domain/services/redis/IRedis.service';
import { RedisChannels } from '@/enums/RedisChannels';
import type { ILeaderManagerService } from '@/domain/services/redis/ILeaderManager.service';

@injectable()
class CoasterController {
  private readonly logger: ILoggerService;
  private readonly coasterService: ICoasterService;
  private readonly redisService: IRedisService;
  private readonly leaderManagerService: ILeaderManagerService;

  constructor(
    @inject(ContainerTypes.Logger) logger: ILoggerService,
    @inject(ContainerTypes.CoasterService) coasterService: ICoasterService,
    @inject(ContainerTypes.RedisService) redisService: IRedisService,
    @inject(ContainerTypes.LeaderManagerService) leaderManagerService: ILeaderManagerService,
  ) {
    this.logger = logger;
    this.coasterService = coasterService;
    this.redisService = redisService;
    this.leaderManagerService = leaderManagerService;
  }

  /**
   * Add new coaster action
   * @param {Request} req Request
   * @param {Response} res Response
   */
  public async addCoasterAction(req: Request, res: Response): Promise<void> {
    try {
      const { numberOfPersonnel, numberOfCustomers, lengthOfRoute, hoursFrom, hoursTo } = req.body;
      const coasterToAdd = new Coaster('', numberOfPersonnel, numberOfCustomers, lengthOfRoute, hoursFrom, hoursTo);

      try {
        coasterToAdd.id = await this.redisService.nextCoasterId();
      } catch (err) {
        this.logger.warn(`Can't set id from redis, set local coaster id`);
      }

      const savedCoaster = this.coasterService.addCoaster(coasterToAdd);

      try {
        await this.redisService.addCoasterPublish(savedCoaster, false, this.leaderManagerService.id);
      } catch (err) {
        this.logger.error(`Error while publish changes to: ${RedisChannels.COASTER_ADD}`);
      }

      res.status(ResponseCodes.CREATED).json(instanceToPlain(savedCoaster));
    } catch (err) {
      this.logger.error(`Error adding coaster: ${err}`);
      res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  /**
   * Update coaster action
   * @param {Request} req Request
   * @param {Response} res Response
   */
  public async updateCoasterAction(req: Request, res: Response): Promise<void> {
    try {
      const coasterId = req.params.coasterId;
      const { numberOfPersonnel, numberOfCustomers, lengthOfRoute, hoursFrom, hoursTo } = req.body;
      const coasterToUpdate = new Coaster(
        coasterId,
        numberOfPersonnel,
        numberOfCustomers,
        lengthOfRoute,
        hoursFrom,
        hoursTo,
      );

      const updatedCoaster = this.coasterService.updateCoaster(coasterId, coasterToUpdate);

      try {
        await this.redisService.updateCoasterPublish(coasterId, updatedCoaster, false, this.leaderManagerService.id);
      } catch (err) {
        this.logger.error(`Error while publish changes to: ${RedisChannels.COASTER_UPDATE}`);
      }

      res.status(ResponseCodes.OK).json(updatedCoaster);
    } catch (err) {
      this.logger.error(`Error updating coaster: ${err}`);
      res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  /**
   * Add new wagon action
   * @param {Request} req Request
   * @param {Response} res Response
   */
  public async addWagonAction(req: Request, res: Response): Promise<void> {
    try {
      const coasterId = req.params.coasterId;
      const { numberOfSeats, speed } = req.body;
      const wagonToAdd = new Wagon('', numberOfSeats, speed);

      try {
        wagonToAdd.id = await this.redisService.nextWagonId();
      } catch (err) {
        this.logger.warn(`Can't set id from redis, set local wagon id`);
      }

      const savedWagon = this.coasterService.addWagon(coasterId, wagonToAdd);

      try {
        await this.redisService.addWagonPublish(coasterId, savedWagon, false, this.leaderManagerService.id);
      } catch (err) {
        this.logger.error(`Error while publish changes to: ${RedisChannels.WAGON_ADD}`);
      }

      res.status(ResponseCodes.CREATED).json(savedWagon);
    } catch (err) {
      this.logger.error(`Error adding wagon: ${err}`);
      res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }

  /**
   * Delete wagon action
   * @param {Request} req Request
   * @param {Response} res Response
   */
  public async deleteWagonAction(req: Request, res: Response): Promise<void> {
    try {
      const { coasterId, wagonId } = req.params;

      const deletedWagon = this.coasterService.deleteWagon(coasterId, wagonId);

      try {
        await this.redisService.deleteWagonPublish(coasterId, wagonId, false, this.leaderManagerService.id);
      } catch (err) {
        this.logger.error(`Error while publish changes to: ${RedisChannels.WAGON_REMOVE}`);
      }

      res.status(ResponseCodes.OK).json(deletedWagon);
    } catch (err) {
      this.logger.error(`Error deleting wagon: ${err}`);
      res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json(err);
    }
  }
}

export default CoasterController;
