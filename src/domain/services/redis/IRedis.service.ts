import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface IRedisService {
  addCoaster(coasterToAdd: Coaster): Promise<Coaster>;
  updateCoaster(coasterId: string, newCoasterData: Coaster): Promise<Coaster>;
  addWagon(coasterId: string, wagonToAdd: Wagon): Promise<Wagon>;
  deleteWagon(coasterId: string, wagonId: string): Promise<Wagon>;

  nextCoasterId(): Promise<string>;
  nextWagonId(): Promise<string>;

  addCoasterPublish(coasterToAdd: Coaster, isSync: boolean, nodeId: string): Promise<void>;
  updateCoasterPublish(coasterId: string, newCoasterData: Coaster, isSync: boolean, nodeId: string): Promise<void>;
  addWagonPublish(coasterId: string, wagonToAdd: Wagon, isSync: boolean, nodeId: string): Promise<void>;
  deleteWagonPublish(coasterId: string, wagonId: string, isSync: boolean, nodeId: string): Promise<void>;
}
