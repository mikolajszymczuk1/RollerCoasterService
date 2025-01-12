export interface ILeaderManagerService {
  get leaderStatus(): boolean;
  get id(): string;
  initLeadershipCheck(): Promise<void>;
}
