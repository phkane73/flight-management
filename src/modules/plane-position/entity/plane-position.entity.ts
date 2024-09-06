import { Airport } from 'src/modules/airport/entity/airport.entity';
import { Plane } from 'src/modules/plane/entity/plane.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plane_position' })
export class PlanePosition {
  @PrimaryGeneratedColumn({ name: 'plane_position_id' })
  id: number;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp', { nullable: true })
  endTime?: Date;

  @ManyToOne(() => Plane)
  plane: Plane;

  @ManyToOne(() => Airport)
  airport: Airport;
}
