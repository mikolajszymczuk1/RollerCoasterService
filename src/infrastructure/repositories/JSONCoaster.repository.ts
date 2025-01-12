import { injectable, inject } from 'inversify';
import { ICoasterRepository } from '@/domain/repositories/ICoaster.repository';
import Coaster from '@/domain/entities/Coaster.entity';
import Wagon from '@/domain/entities/Wagon.entity';
import JSONClient from '@/infrastructure/database/jsonClient';
import { ContainerTypes } from '@/types/common';

@injectable()
class JSONCoasterRepository implements ICoasterRepository<Coaster | Wagon> {
  private readonly jsonClient: JSONClient;

  constructor(@inject(ContainerTypes.JSONClient) jsonClient: JSONClient) {
    this.jsonClient = jsonClient;
  }

  /**
   * Add new coaster
   * @param {Coaster} coasterToAdd coaster data to save
   * @returns {Coaster} added coaster
   */
  public addCoaster(coasterToAdd: Coaster): Coaster {
    const coastersMap = this.jsonClient.readData();
    const id = coasterToAdd.id === '' ? this.nextCoasterId() : coasterToAdd.id;
    const coaster = coasterToAdd;
    coaster.id = id;
    coastersMap.set(id, coaster);
    this.jsonClient.writeData(coastersMap);
    return coaster;
  }

  /**
   * Update coaster data
   * @param {string} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data to save
   * @returns {Coaster} updated coaster
   */
  public updateCoaster(coasterId: string, newCoasterData: Coaster): Coaster {
    const coastersMap = this.jsonClient.readData();
    const coaster = coastersMap.get(coasterId);

    if (!coaster) {
      throw new Error(`Coaster with id ${coasterId} not found`);
    }

    const updatedCoaster = newCoasterData;
    updatedCoaster.id = coaster.id;
    coastersMap.set(coasterId, updatedCoaster);
    this.jsonClient.writeData(coastersMap);
    return updatedCoaster;
  }

  /**
   * Add new wagon to coaster
   * @param {number} coasterId coaster id
   * @param {Wagon} wagonToAdd wagon data to add
   * @returns {Wagon} added wagon
   */
  public addWagon(coasterId: string, wagonToAdd: Wagon): Wagon {
    const coastersMap = this.jsonClient.readData();
    const coaster = coastersMap.get(coasterId);

    if (!coaster) {
      throw new Error(`Coaster with id ${coasterId} not found`);
    }

    const id = wagonToAdd.id === '' ? this.nextWagonId() : wagonToAdd.id;
    const wagon = wagonToAdd;
    wagon.id = id;
    coaster.wagons.push(wagon);

    coastersMap.set(coasterId, coaster);
    this.jsonClient.writeData(coastersMap);
    return wagon;
  }

  /**
   * Delete single wagon
   * @param {string} coasterId coaster id
   * @param {string} wagonId wagon id
   * @returns {Wagon} deleted wagon
   */
  public deleteWagon(coasterId: string, wagonId: string): Wagon {
    const coastersMap = this.jsonClient.readData();
    const coaster = coastersMap.get(coasterId);

    if (!coaster) {
      throw new Error(`Coaster with id ${coasterId} not found`);
    }

    const wagon = coaster.wagons.find((wagon) => wagon.id === wagonId);

    if (!wagon) {
      throw new Error(`Wagon with id ${wagonId} not found in coaster with id ${coasterId}`);
    }

    coaster.wagons = coaster.wagons.filter((wagon) => wagon.id !== wagonId);
    coastersMap.set(coasterId, coaster);
    this.jsonClient.writeData(coastersMap);
    return wagon;
  }

  /**
   * Get next coaster id value (local id in timestamp style, for synchronization process)
   * @returns {string} new coaster id
   */
  public nextCoasterId(): string {
    return `coaster:local:${new Date().getTime()}`;
  }

  /**
   * Get next wagon id value (local id in timestamp style, for synchronization process)
   * @returns {string} new wagon id
   */
  public nextWagonId(): string {
    return `wagon:local:${new Date().getTime()}`;
  }
}

export default JSONCoasterRepository;
