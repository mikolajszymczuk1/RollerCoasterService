import { injectable, inject } from 'inversify';
import { ICoasterRepository } from '@/domain/repositories/ICoaster.repository';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

@injectable()
class RedisCoasterRepository implements ICoasterRepository {
  public addCoaster(coasterToAdd: Coaster): Coaster {
    return new Coaster(1, 10, 1000, 200, '10:00', '18:00');
  }

  public updateCoaster(coasterId: number, newCoasterData: Coaster): Coaster {
    return new Coaster(1, 100, 2000, 500, '11:00', '18:00');
  }

  public addWagon(wagonToAdd: Wagon): Wagon {
    return new Wagon(1, 1.6);
  }

  public deleteWagon(wagonId: number): Wagon {
    return new Wagon(1, 1.8);
  }
}

export default RedisCoasterRepository;
