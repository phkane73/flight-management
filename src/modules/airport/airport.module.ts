import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airport } from 'src/modules/airport/entity/airport.entity';
import { AirportController } from './airport.controller';
import { AirportService } from './airport.service';

@Module({
  imports: [TypeOrmModule.forFeature([Airport])],
  controllers: [AirportController],
  providers: [AirportService],
  exports: [AirportService],
})
export class AirportModule {}
