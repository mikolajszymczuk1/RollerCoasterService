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
  private readonly filePath: string;

  private coasterId: number;
  private wagonId: number;

  constructor(@inject(ContainerTypes.Logger) logger: Logger) {
    this.logger = logger;
    this.filePath = path.resolve(__dirname, `../src/data/data.${process.env.ENV_TYPE}.json`);
    const data = this.readData();
    const allCoasters = Array.from(data.values());
    const allWagons = allCoasters.flatMap((coaster) => coaster.wagons || []);
    this.coasterId = Math.max(0, ...allCoasters.map((coaster) => coaster.id));
    this.wagonId = Math.max(0, ...allWagons.map((wagon) => wagon.id));
  }

  /**
   * Get next coaster id value
   * @returns {number} new coaster id
   */
  public get nextCoasterId(): number {
    return ++this.coasterId;
  }

  /**
   * Get next wagon id value
   * @returns {number} new wagon id
   */
  public get nextWagonId(): number {
    return ++this.wagonId;
  }

  /**
   * Read json file and convert data to map format
   * @returns {Map<number, Coaster>} coasters map
   */
  public readData(): Map<number, Coaster> {
    try {
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, '[]');
      }
      const data = fs.readFileSync(this.filePath, 'utf8');
      const coasters = plainToInstance(Coaster, JSON.parse(data));
      const coastersMap = new Map<number, Coaster>();
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
   * @param {Map<number, Coaster>} data map data to save
   */
  public writeData(data: Map<number, Coaster>): void {
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
