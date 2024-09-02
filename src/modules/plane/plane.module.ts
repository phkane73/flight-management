import { Module } from '@nestjs/common';
import { PlaneService } from './plane.service';
import { PlaneController } from './plane.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plane } from 'src/modules/plane/entity/plane.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Plane])],
  controllers: [PlaneController],
  providers: [PlaneService],
})
export class PlaneModule {}
