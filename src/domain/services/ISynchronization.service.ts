export interface ISynchronizationService {
  get lastSynchronization(): number;
  updateLastSynchronization(value: number): void;
}
