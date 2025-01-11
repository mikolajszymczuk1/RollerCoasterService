import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface ICoasterRepository<ResultType> {
  addCoaster(coasterToAdd: Coaster): ResultType;
  updateCoaster(coasterId: string, newCoasterData: Coaster): ResultType;
  addWagon(coasterId: string, wagonToAdd: Wagon): ResultType;
  deleteWagon(coasterId: string, wagonId: string): ResultType;
  nextCoasterId(): string | Promise<string>;
  nextWagonId(): string | Promise<string>;
}
