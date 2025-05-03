import Coaster from '@/domain/entities/Coaster.entity';
import SyncTime from '@/domain/entities/SyncTime.entity';

export interface IJSONClient {
  readData(): Map<string, Coaster>;
  writeData(data: Map<string, Coaster>): void;
  readSynchronizationTime(): SyncTime;
  updateSynchronizationTime(syncTime: SyncTime): void;
}
