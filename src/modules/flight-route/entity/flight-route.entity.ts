import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'flight_route' })
export class FlightRoute {
  @PrimaryGeneratedColumn({ name: 'flight_route_id' })
  id: number;

  @Column()
  flightRouteEstTime: number;

  @Column('bigint')
  flightRoutePrice: string;
}
