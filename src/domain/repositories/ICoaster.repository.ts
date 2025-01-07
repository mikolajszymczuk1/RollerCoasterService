import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface ICoasterRepository {
  addCoaster(coasterToAdd: Coaster): Coaster;
  updateCoaster(coasterId: number, newCoasterData: Coaster): Coaster;
  addWagon(wagonToAdd: Wagon): Wagon;
  deleteWagon(wagonId: number): Wagon;
}
