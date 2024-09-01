import { Runway } from 'src/modules/runway/entity/runway.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'airport' })
export class Airport {
  @PrimaryGeneratedColumn({ name: 'airport_id' })
  id: number;

  @Column({ length: 50 })
  airportCode: string;

  @Column({ length: 100 })
  airportName: string;

  @Column({ length: 100 })
  airportLocation: string;

  @Column()
  isOperating: boolean;

  @OneToMany(() => Runway, (runway) => runway.airport)
  runways: Runway[];
}
