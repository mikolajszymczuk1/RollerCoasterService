import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';

export interface IRedisService {
  addCoasterPublish(coasterToAdd: Coaster): Promise<void>;
  updateCoasterPublish(coasterId: number, newCoasterData: Coaster): Promise<void>;
  addWagonPublish(coasterId: number, wagonToAdd: Wagon): Promise<void>;
  deleteWagonPublish(coasterId: number, wagonId: number): Promise<void>;
  initSubscribers(): Promise<void>;
}
