import { Airport } from 'src/modules/airport/entity/airport.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'flight_route' })
export class FlightRoute {
  @PrimaryGeneratedColumn({ name: 'flight_route_id' })
  id: number;

  @Column('bigint')
  flightRouteEstTime: number;

  @Column('bigint')
  flightRoutePrice: string;

  @ManyToOne(() => Airport)
  departureAirport: Airport;

  @ManyToOne(() => Airport)
  arrivalAirport: Airport;
}
