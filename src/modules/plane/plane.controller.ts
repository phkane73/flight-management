import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { CreatePlaneDto } from 'src/modules/plane/dto/create-plane.dto';
import { UpdatePlaneDto } from 'src/modules/plane/dto/update-plane.dto';
import { Plane } from 'src/modules/plane/entity/plane.entity';
import { PlaneService } from './plane.service';

@Controller('plane')
export class PlaneController {
  constructor(private readonly planeService: PlaneService) {}

  @Post('create')
  addPlane(@Body() createPlaneDto: CreatePlaneDto): Promise<Response<Plane>> {
    return this.planeService.addPlane(createPlaneDto);
  }

  @Patch('update')
  updatePlane(@Body() updatePlaneDto: UpdatePlaneDto): Promise<Response<Plane>> {
    return this.planeService.updatePlane(updatePlaneDto);
  }

  @Get('get-all')
  getAllPlane(): Promise<Plane[]> {
    return this.planeService.getAllPlane();
  }

  @Get('get-operating')
  getPlaneIsOperating(): Promise<Plane[]> {
    return this.planeService.getPlaneIsOperating();
  }
}
