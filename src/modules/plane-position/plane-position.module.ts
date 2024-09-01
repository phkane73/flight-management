import { Module } from '@nestjs/common';
import { PlanePositionService } from './plane-position.service';
import { PlanePositionController } from './plane-position.controller';

@Module({
  controllers: [PlanePositionController],
  providers: [PlanePositionService],
})
export class PlanePositionModule {}
