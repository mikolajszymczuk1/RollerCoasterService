import { instanceToPlain, plainToInstance } from 'class-transformer';
import { injectable, inject } from 'inversify';
import fs from 'fs';
import path from 'path';
import Logger from '@/infrastructure/logger';
import { ContainerTypes } from '@/types/common';
import Coaster from '@/domain/entities/Coaster.entity';

@injectable()
class JSONClient {
  private readonly logger: Logger;
  private readonly dirPath: string;
  private readonly filePath: string;
  private readonly syncTimePath: string;
  private readonly leaderLogsPath: string;
  private readonly localLogsPath: string;

  constructor(@inject(ContainerTypes.Logger) logger: Logger) {
    this.logger = logger;
    this.dirPath = path.resolve(__dirname, '../src/data');
    this.filePath = path.resolve(__dirname, `../src/data/data.${process.env.ENV_TYPE}.json`);
    this.syncTimePath = path.resolve(__dirname, `../src/data/synchronizationTime.${process.env.ENV_TYPE}.json`);
    this.leaderLogsPath = path.resolve(__dirname, `../src/data/leader.logs.${process.env.ENV_TYPE}.json`);
    this.localLogsPath = path.resolve(__dirname, `../data/local.logs.${process.env.ENV_TYPE}.json`);

    try {
      if (!fs.existsSync(this.dirPath)) {
        fs.mkdirSync(this.dirPath);
      }
    } catch (err) {
      this.logger.error(`Could not create data directory: ${err}`);
    }

    this.readData();
  }

  /**
   * Read json file and convert data to coasters map format
   * @returns {Map<string, Coaster>} coasters map
   */
  public readData(): Map<string, Coaster> {
    try {
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, '[]');
      }

      const data = fs.readFileSync(this.filePath, 'utf8');
      const coasters = plainToInstance(Coaster, JSON.parse(data));
      const coastersMap = new Map<string, Coaster>();
      coasters.forEach((coaster) => {
        coastersMap.set(coaster.id, coaster);
      });
      return coastersMap;
    } catch (err) {
      this.logger.error(`Error reading JSON data: ${err}`);
      throw err;
    }
  }

  /**
   * Save new coasters data into json file
   * @param {Map<string, Coaster>} data map data to save
   */
  public writeData(data: Map<string, Coaster>): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, '[]');
      }

      const coasters = Array.from(data.values());
      fs.writeFileSync(this.filePath, JSON.stringify(instanceToPlain(coasters), null, 2));
    } catch (err) {
      this.logger.error(`Error writing JSON data: ${err}`);
      throw err;
    }
  }
}

export default JSONClient;
