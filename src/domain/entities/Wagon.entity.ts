import { Expose } from 'class-transformer';

class Wagon {
  @Expose()
  id: string;

  @Expose()
  numberOfSeats: number;

  @Expose()
  speed: number;

  constructor(id: string, numberOfSeats: number, speed: number) {
    this.id = id;
    this.numberOfSeats = numberOfSeats;
    this.speed = speed;
  }
}

export default Wagon;
