import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'runway' })
export class Runway {
  @PrimaryGeneratedColumn({ name: 'runway_id' })
  id: number;

  @Column({ length: 50 })
  runwayCode: string;

  @Column({ length: 100 })
  runwayType: string;

  @Column('timestamp')
  availableTime: Date;

  @Column()
  isOperating: boolean;
}
