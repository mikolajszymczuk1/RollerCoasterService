import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface IRedisService {
  addCoasterPublish(coasterToAdd: Coaster): Promise<void>;
  updateCoasterPublish(coasterId: string, newCoasterData: Coaster): Promise<void>;
  addWagonPublish(coasterId: string, wagonToAdd: Wagon): Promise<void>;
  deleteWagonPublish(coasterId: string, wagonId: string): Promise<void>;
  nextCoasterId(): Promise<string>;
  nextWagonId(): Promise<string>;
  initSubscribers(): Promise<void>;
}
