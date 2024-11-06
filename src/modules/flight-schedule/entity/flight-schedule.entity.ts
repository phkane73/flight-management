import { Flight } from 'src/modules/flight/entity/flight.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'flight_schedule' })
export class FlightSchedule {
  @PrimaryGeneratedColumn({ name: 'flight_schedule_id' })
  id: number;

  @Column('timestamp')
  startTimeSchedule: Date;

  @Column('timestamp')
  endTimeSchedule: Date;

  @Column({ default: false })
  approved: boolean;

  @OneToMany(() => Flight, (flight) => flight.flightSchedule, { cascade: true })
  flights: Flight[];
}
