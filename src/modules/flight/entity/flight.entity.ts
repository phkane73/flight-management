import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
