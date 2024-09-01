import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plane' })
export class Plane {
  @PrimaryGeneratedColumn({ name: 'plane_id' })
  id: number;

  @Column({ length: 50 })
  planeName: string;

  @Column()
  isOperating: boolean;
}
