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

  constructor(@inject(ContainerTypes.Logger) logger: Logger) {
    this.logger = logger;
    this.dirPath = path.resolve(__dirname, '../src/data');
    this.filePath = path.resolve(__dirname, `../src/data/data.${process.env.ENV_TYPE}.json`);
    this.readData();
  }

  /**
   * Read json file and convert data to map format
   * @returns {Map<string, Coaster>} coasters map
   */
  public readData(): Map<string, Coaster> {
    try {
      if (!fs.existsSync(this.dirPath)) {
        fs.mkdirSync(this.dirPath);
      }

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
   * Save new data into json file
   * @param {Map<string, Coaster>} data map data to save
   */
  public writeData(data: Map<string, Coaster>): void {
    try {
      const coasters = Array.from(data.values());
      fs.writeFileSync(this.filePath, JSON.stringify(instanceToPlain(coasters), null, 2));
    } catch (err) {
      this.logger.error(`Error writing JSON data: ${err}`);
      throw err;
    }
  }
}

export default JSONClient;
