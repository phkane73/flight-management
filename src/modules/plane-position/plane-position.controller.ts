import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { CreatePlanePositionDto } from 'src/modules/plane-position/dto/create-plane-position.dto';
import { MovePlaneDto } from 'src/modules/plane-position/dto/move-plane.dto';
import { UpdatePlanePositionDto } from 'src/modules/plane-position/dto/update-plane-position.dto';
import { PlanePosition } from 'src/modules/plane-position/entity/plane-position.entity';
import { PlanePositionService } from './plane-position.service';

@Controller('plane-position')
export class PlanePositionController {
  constructor(private readonly planePositionService: PlanePositionService) {}

  @Post('create')
  addPlanePosition(
    @Body() createPlanePositionDto: CreatePlanePositionDto,
  ): Promise<Response<PlanePosition>> {
    return this.planePositionService.addPlanePosition(createPlanePositionDto);
  }

  @Get('get-all')
  getAllPlanePosition(): Promise<PlanePosition[]> {
    return this.planePositionService.getAllPlanePosition();
  }

  @Patch('update')
  updatePlanePosition(
    @Body() updatePlanePositionDto: UpdatePlanePositionDto,
  ): Promise<Response<PlanePosition>> {
    return this.planePositionService.updatePlanePosition(updatePlanePositionDto);
  }

  @Get('get-all-plane/:airportId')
  getAllPlaneAtAirport(@Param('airportId') airportId: number) {
    return this.planePositionService.getAllPlaneAtAirport(airportId);
  }

  @Post('move-plane')
  movePlane(@Body() movePlaneDto: MovePlaneDto): Promise<Response<PlanePosition>> {
    return this.planePositionService.movePlane(movePlaneDto);
  }
}
