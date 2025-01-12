import { Expose } from 'class-transformer';
import type { OperationType } from '@/types/common';

class OperationLog {
  @Expose()
  timestamp: number;

  @Expose()
  operationType: OperationType;

  @Expose()
  data: string;

  constructor(timestamp: number, operationType: OperationType, data: string) {
    this.timestamp = timestamp;
    this.operationType = operationType;
    this.data = data;
  }
}

export default OperationLog;
