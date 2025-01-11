import { injectable, inject } from 'inversify';
import type { ICoasterService } from '@/domain/services/ICoaster.service';
import type { ICoasterRepository } from '@/domain/repositories/ICoaster.repository';
import { ContainerTypes } from '@/types/common';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

@injectable()
class CoasterService implements ICoasterService {
  private readonly jsonCoasterRepository: ICoasterRepository<Coaster | Wagon>;

  constructor(
    @inject(ContainerTypes.JSONCoasterRepository) jsonCoasterRepository: ICoasterRepository<Coaster | Wagon>,
  ) {
    this.jsonCoasterRepository = jsonCoasterRepository;
  }

  /**
   * Add new coaster + pub changes to redis
   * @param {Coaster} coasterToAdd coaster data to save
   * @returns {Coaster} added coaster
   */
  public addCoaster(coasterToAdd: Coaster): Coaster {
    return this.jsonCoasterRepository.addCoaster(coasterToAdd) as Coaster;
  }

  /**
   * Update coaster data + pub changes to redis
   * @param {string} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data to save
   * @returns {Coaster} updated coaster
   */
  public updateCoaster(coasterId: string, newCoasterData: Coaster): Coaster {
    return this.jsonCoasterRepository.updateCoaster(coasterId, newCoasterData) as Coaster;
  }

  /**
   * Add new wagon to coaster + pub changes to redis
   * @param {string} coasterId coaster id
   * @param {Wagon} wagonToAdd wagon data to add
   * @returns {Wagon} added wagon
   */
  public addWagon(coasterId: string, wagonToAdd: Wagon): Wagon {
    return this.jsonCoasterRepository.addWagon(coasterId, wagonToAdd) as Wagon;
  }

  /**
   * Delete single wagon + pub changes to redis
   * @param {string} coasterId coaster id
   * @param {string} wagonId wagon id
   * @returns {Wagon} deleted wagon
   */
  public deleteWagon(coasterId: string, wagonId: string): Wagon {
    return this.jsonCoasterRepository.deleteWagon(coasterId, wagonId) as Wagon;
  }
}

export default CoasterService;
