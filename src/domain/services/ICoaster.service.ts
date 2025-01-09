import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface ICoasterService {
  addCoaster(coasterToAdd: Coaster): Coaster;
  updateCoaster(coasterId: number, newCoasterData: Coaster): Coaster;
  addWagon(coasterId: number, wagonToAdd: Wagon): Wagon;
  deleteWagon(coasterId: number, wagonId: number): Wagon;
}
