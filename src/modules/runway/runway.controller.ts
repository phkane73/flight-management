import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { CreateRunwayDto } from 'src/modules/runway/dto/create-runway.dto';
import { Runway } from 'src/modules/runway/entity/runway.entity';
import { RunwayService } from './runway.service';

@Controller('runway')
export class RunwayController {
  constructor(private readonly runwayService: RunwayService) {}

  @Post('create')
  createRunway(@Body() createRunwayDto: CreateRunwayDto): Promise<Response<Runway>> {
    return this.runwayService.addRunway(createRunwayDto);
  }

  @Get('get-all')
  getAllRunway(): Promise<Runway[]> {
    return this.runwayService.getAllRunway();
  }

  @Delete('delete/:id')
  removeRunway(@Param('id') id: number): Promise<Response<Runway>> {
    return this.runwayService.removeRunway(id);
  }
}
