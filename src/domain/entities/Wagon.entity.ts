import { Expose } from 'class-transformer';

class Wagon {
  @Expose()
  numberOfSeats: number;

  @Expose()
  speed: number;

  constructor(numberOfSeats: number, speed: number) {
    this.numberOfSeats = numberOfSeats;
    this.speed = speed;
  }
}

export default Wagon;
