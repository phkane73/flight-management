import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { CreateRunwayDto } from 'src/modules/runway/dto/create-runway.dto';
import { UpdateRunwayDto } from 'src/modules/runway/dto/update-runway.dto';
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
    const runway = this.runwayRepository.create({
      airport,
      availableTime: createRunwayDto.availableTime,
      isOperating: createRunwayDto.isOperating,
      runwayCode: createRunwayDto.runwayCode,
      runwayType: createRunwayDto.runwayType,
    });
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

  async updateRunway(updateRunwayDto: UpdateRunwayDto): Promise<Response<Runway>> {
    const { id } = updateRunwayDto;
    await this.runwayRepository.update(id, { ...updateRunwayDto });
    return {
      code: 200,
      message: 'Update runway successfully',
    };
  }
}
