import { Expose, Type } from 'class-transformer';
import Wagon from '@/domain/entities/Wagon.entity';

class Coaster {
  @Expose()
  id: number;

  @Expose()
  numberOfPersonnel: number;

  @Expose()
  numberOfCustomers: number;

  @Expose()
  lengthOfRoute: number;

  @Expose()
  hoursFrom: string;

  @Expose()
  hoursTo: string;

  @Expose()
  @Type(() => Wagon)
  wagons: Wagon[] = [];

  constructor(
    id: number,
    numberOfPersonnel: number,
    numberOfCustomers: number,
    lengthOfRoute: number,
    hoursFrom: string,
    hoursTo: string,
    wagons: Wagon[] = [],
  ) {
    this.id = id;
    this.numberOfPersonnel = numberOfPersonnel;
    this.numberOfCustomers = numberOfCustomers;
    this.lengthOfRoute = lengthOfRoute;
    this.hoursFrom = hoursFrom;
    this.hoursTo = hoursTo;
    this.wagons = wagons;
  }
}

export default Coaster;
