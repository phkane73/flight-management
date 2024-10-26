import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { Pagination } from 'src/common/interface/pagination.interface';
import { CreatePlanePositionDto } from 'src/modules/plane-position/dto/create-plane-position.dto';
import { MovePlaneDto } from 'src/modules/plane-position/dto/move-plane.dto';
import { SearchPlanePositionDto } from 'src/modules/plane-position/dto/search-plane-position.dto';
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
  @UsePipes(new ValidationPipe({ transform: true }))
  getAllPlanePosition(
    @Query() searchPlanePosition: SearchPlanePositionDto,
  ): Promise<Pagination<PlanePosition>> {
    return this.planePositionService.getAllPlanePosition(searchPlanePosition);
  }

  @Patch('update')
  updatePlanePosition(
    @Body() updatePlanePositionDto: UpdatePlanePositionDto,
  ): Promise<Response<PlanePosition>> {
    return this.planePositionService.updatePlanePosition(updatePlanePositionDto);
  }

  @Delete('delete/:id')
  deletePlanePosition(@Param('id') id: number): Promise<Response<PlanePosition>> {
    return this.planePositionService.deletePlanePosition(id);
  }

  @Get('get-all-plane/:airportId')
  getAllPlaneAtAirport(@Param('airportId') airportId: number) {
    return this.planePositionService.getAllPlaneAtAirport(airportId);
  }

  @Post('move-plane')
  movePlane(@Body() movePlaneDto: MovePlaneDto): Promise<Response<PlanePosition>> {
    return this.planePositionService.movePlane(movePlaneDto);
  }

  @Get('get-plane-no-position')
  getPlaneHaveNoPosition() {
    return this.planePositionService.getPlanesHaveNoPosition();
  }
}
