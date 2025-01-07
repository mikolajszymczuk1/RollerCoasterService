import { Expose } from 'class-transformer';

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

  constructor(
    id: number,
    numberOfPersonnel: number,
    numberOfCustomers: number,
    lengthOfRoute: number,
    hoursFrom: string,
    hoursTo: string,
  ) {
    this.id = id;
    this.numberOfPersonnel = numberOfPersonnel;
    this.numberOfCustomers = numberOfCustomers;
    this.lengthOfRoute = lengthOfRoute;
    this.hoursFrom = hoursFrom;
    this.hoursTo = hoursTo;
  }
}

export default Coaster;
