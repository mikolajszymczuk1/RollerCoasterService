export interface ILeaderManagerService {
  get leaderStatus(): boolean;
  initLeadershipCheck(): Promise<void>;
}
