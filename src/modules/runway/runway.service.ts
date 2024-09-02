import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { CreateRunwayDto } from 'src/modules/runway/dto/create-runway.dto';
import { Runway } from 'src/modules/runway/entity/runway.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RunwayService {
  constructor(
    @InjectRepository(Runway)
    private runwayRepository: Repository<Runway>,
    private airportService: AirportService,
  ) {}

  async addRunway(createRunwayDto: CreateRunwayDto): Promise<Response<Runway>> {
    const airport = await this.airportService.findAirportById(createRunwayDto.airportId);
    const runway = new Runway();
    runway.airport = airport;
    runway.availableTime = createRunwayDto.availableTime;
    runway.isOperating = createRunwayDto.isOperating;
    runway.runwayCode = createRunwayDto.runwayCode;
    runway.runwayType = createRunwayDto.runwayType;
    try {
      await this.runwayRepository.save(runway);
      return {
        code: 200,
        message: 'Add runway successfully',
      };
    } catch (error) {
      return {
        code: 400,
        message: error.message,
      };
    }
  }

  async getAllRunway(): Promise<Runway[]> {
    return await this.runwayRepository.find();
  }

  async removeRunway(id: number): Promise<Response<Runway>> {
    await this.runwayRepository.delete(id);
    return {
      code: 200,
      message: 'Delete runway successfully',
    };
  }
}
