import { Airport } from 'src/modules/airport/entity/airport.entity';
import { RunwayTypeEnum } from 'src/modules/runway/enum/runway-type.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'runway' })
export class Runway {
  @PrimaryGeneratedColumn({ name: 'runway_id' })
  id: number;

  @Column({ length: 50 })
  runwayCode: string;

  @Column()
  runwayType: RunwayTypeEnum;

  @Column('timestamp', { nullable: true })
  availableTime?: Date;

  @Column({ default: false })
  isOperating: boolean;

  @ManyToOne(() => Airport, (airport) => airport.runways)
  airport: Airport;
}
