import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface ICoasterRepository<ResultType> {
  addCoaster(coasterToAdd: Coaster): ResultType;
  updateCoaster(coasterId: number, newCoasterData: Coaster): ResultType;
  addWagon(coasterId: number, wagonToAdd: Wagon): ResultType;
  deleteWagon(coasterId: number, wagonId: number): ResultType;
}
