import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface ICoasterService {
  addCoaster(coasterToAdd: Coaster): Coaster;
  updateCoaster(coasterId: string, newCoasterData: Coaster): Coaster;
  addWagon(coasterId: string, wagonToAdd: Wagon): Wagon;
  deleteWagon(coasterId: string, wagonId: string): Wagon;
}
