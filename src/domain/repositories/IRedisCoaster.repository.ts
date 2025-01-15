import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface IRedisCoasterRepository {
  addCoaster(coasterToAdd: Coaster): Promise<Coaster>;
  updateCoaster(coasterId: string, newCoasterData: Coaster): Promise<Coaster>;
  addWagon(coasterId: string, wagonToAdd: Wagon): Promise<Wagon>;
  deleteWagon(coasterId: string, wagonId: string): Promise<Wagon>;
  nextCoasterId(): Promise<string>;
  nextWagonId(): Promise<string>;
}
