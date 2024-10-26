import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Response } from 'src/common/interface/error.interface';
import { CreateRunwayDto } from 'src/modules/runway/dto/create-runway.dto';
import { UpdateRunwayDto } from 'src/modules/runway/dto/update-runway.dto';
import { Runway } from 'src/modules/runway/entity/runway.entity';
import { RunwayTypeEnum } from 'src/modules/runway/enum/runway-type.enum';
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

  @Get('get-alls')
  getAllRunways(): Promise<Runway[]> {
    return this.runwayService.getRunwaysByAirportAndType(1, RunwayTypeEnum.TakeOff);
  }

  @Delete('delete/:id')
  removeRunway(@Param('id') id: number): Promise<Response<Runway>> {
    return this.runwayService.removeRunway(id);
  }

  @Patch('update')
  updateRunways(@Body() updateRunwayDtoList: UpdateRunwayDto[]): Promise<Response<Runway>> {
    return this.runwayService.updateRunways(updateRunwayDtoList);
  }

  @Patch('reset/:id')
  resetAvailableTime(@Param('id') id: number) {
    return this.runwayService.resetAvailableTime(id);
  }
}
