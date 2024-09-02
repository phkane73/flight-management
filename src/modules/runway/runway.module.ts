import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirportModule } from 'src/modules/airport/airport.module';
import { Runway } from 'src/modules/runway/entity/runway.entity';
import { RunwayController } from './runway.controller';
import { RunwayService } from './runway.service';

@Module({
  imports: [TypeOrmModule.forFeature([Runway]), AirportModule],
  controllers: [RunwayController],
  providers: [RunwayService],
})
export class RunwayModule {}
