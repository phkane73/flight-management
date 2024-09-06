import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportModule } from 'src/modules/airport/airport.module';
import { PlanePosition } from 'src/modules/plane-position/entity/plane-position.entity';
import { PlaneModule } from 'src/modules/plane/plane.module';
import { PlanePositionController } from './plane-position.controller';
import { PlanePositionService } from './plane-position.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanePosition]), AirportModule, PlaneModule],
  controllers: [PlanePositionController],
  providers: [PlanePositionService],
})
export class PlanePositionModule {}
