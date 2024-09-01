import { FlightRoute } from 'src/modules/flight-route/entity/flight-route.entity';
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

  @ManyToOne(() => FlightRoute)
  flightRoute: FlightRoute;

  @ManyToOne(() => Plane)
  plane: Plane;
}
