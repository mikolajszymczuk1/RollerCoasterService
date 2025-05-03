import { Expose } from 'class-transformer';

class SyncTime {
  @Expose()
  timestamp: number;

  constructor(timestamp: number) {
    this.timestamp = timestamp;
  }
}

export default SyncTime;
