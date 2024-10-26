import { Airport } from 'src/modules/airport/entity/airport.entity';
import { Plane } from 'src/modules/plane/entity/plane.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'flight' })
export class Flight {
  @PrimaryGeneratedColumn({ name: 'flight_id' })
  id: number;

  @Column({ length: 50 })
  flightCode: string;

  @Column('timestamp')
  arrivalTime: Date;

  @Column('timestamp')
  departureTime: Date;

  @ManyToOne(() => Airport)
  departureAirport: Airport;

  @ManyToOne(() => Airport)
  arrivalAirport: Airport;

  @ManyToOne(() => Plane)
  plane: Plane;
}
