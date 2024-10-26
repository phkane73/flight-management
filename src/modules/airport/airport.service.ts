import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { CreateAirportDto } from 'src/modules/airport/dto/create-airport.dto';
import { UpdateAirportDto } from 'src/modules/airport/dto/update-airport.dto';
import { Airport } from 'src/modules/airport/entity/airport.entity';
import { RunwayService } from 'src/modules/runway/runway.service';
import { Repository } from 'typeorm';

@Injectable()
export class AirportService {
  constructor(
    @InjectRepository(Airport)
    private readonly airportRepository: Repository<Airport>,
    @Inject(forwardRef(() => RunwayService))
    private readonly runwayService: RunwayService,
  ) {}

  async addAirport(createAirportDto: CreateAirportDto): Promise<Response<Airport>> {
    const isExist = await this.airportRepository.findOne({
      where: {
        airportCode: createAirportDto.airportCode,
      },
    });
    if (isExist) {
      return {
        code: 400,
        message: 'Airport already exists',
      };
    }
    try {
      const airport = await this.airportRepository.save(createAirportDto);
      return {
        code: 200,
        message: 'Add airport successfully',
        data: airport,
      };
    } catch {
      return {
        code: 400,
        message: 'Failed to create airport',
      };
    }
  }

  async getAllAirport(): Promise<Airport[]> {
    return await this.airportRepository.find({
      relations: {
        runways: true,
      },
    });
  }

  async getAirportIsOperating(): Promise<Airport[]> {
    return await this.airportRepository.findBy({ isOperating: true });
  }

  async getOneAirport(id: number): Promise<Airport> {
    return await this.airportRepository.findOne({
      where: { id },
      relations: {
        planePositions: {
          plane: true,
        },
        runways: true,
      },
    });
  }

  async updateAirport(updateAirportDto: UpdateAirportDto) {
    const { id } = updateAirportDto;
    if (updateAirportDto.isOperating===true) {
      const checkRunwayExist = await this.runwayService.getRunwayByAirportId(id);
      if (checkRunwayExist.length===0) {
        return {
          code: 400,
          message: 'No runway available. Please add more runways',
        };
      }
    }
    await this.airportRepository.update(id, {
      ...updateAirportDto,
    });
    return {
      code: 200,
      message: 'Update airport successfully',
    };
  }

  async findAirportById(id: number): Promise<Airport> {
    if (id)
      return await this.airportRepository.findOne({
        where: { id },
        relations: {
          planePositions: true,
        },
      });
  }
}
