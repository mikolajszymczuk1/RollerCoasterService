import { Expose } from 'class-transformer';

class Wagon {
  @Expose()
  id: number;

  @Expose()
  numberOfSeats: number;

  @Expose()
  speed: number;

  constructor(id: number, numberOfSeats: number, speed: number) {
    this.id = id;
    this.numberOfSeats = numberOfSeats;
    this.speed = speed;
  }
}

export default Wagon;
