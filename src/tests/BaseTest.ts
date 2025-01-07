import 'reflect-metadata';
import { loadEnvironment } from '@/config/environment';

class BaseTest {
  constructor() {
    this.loadTestEnv();
  }

  private loadTestEnv(): void {
    loadEnvironment();
  }
}

export default BaseTest;
