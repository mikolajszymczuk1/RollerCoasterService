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
    const id = this.jsonClient.nextCoasterId;
    const coaster = coasterToAdd;
    coaster.id = id;
    coastersMap.set(id, coaster);
    this.jsonClient.writeData(coastersMap);
    return coaster;
  }

  /**
   * Update coaster data
   * @param {number} coasterId coaster id
   * @param {Coaster} newCoasterData new coaster data to save
   * @returns {Coaster} updated coaster
   */
  public updateCoaster(coasterId: number, newCoasterData: Coaster): Coaster {
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
  public addWagon(coasterId: number, wagonToAdd: Wagon): Wagon {
    const coastersMap = this.jsonClient.readData();
    const coaster = coastersMap.get(coasterId);

    if (!coaster) {
      throw new Error(`Coaster with id ${coasterId} not found`);
    }

    const id = this.jsonClient.nextWagonId;
    const wagon = wagonToAdd;
    wagon.id = id;
    coaster.wagons.push(wagon);

    coastersMap.set(coasterId, coaster);
    this.jsonClient.writeData(coastersMap);
    return wagon;
  }

  /**
   * Delete single wagon
   * @param {number} coasterId coaster id
   * @param {number} wagonId wagon id
   * @returns {Wagon} deleted wagon
   */
  public deleteWagon(coasterId: number, wagonId: number): Wagon {
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
}

export default JSONCoasterRepository;
