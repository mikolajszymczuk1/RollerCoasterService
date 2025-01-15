import Coaster from '@/domain/entities/Coaster.entity';

export interface IJSONClient {
  readData(): Map<string, Coaster>;
  writeData(data: Map<string, Coaster>): void;
}
