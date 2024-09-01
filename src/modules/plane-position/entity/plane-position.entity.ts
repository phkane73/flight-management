import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plane_position' })
export class PlanePosition {
  @PrimaryGeneratedColumn({ name: 'plane_position_id' })
  id: number;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  readyTime: Date;
}
