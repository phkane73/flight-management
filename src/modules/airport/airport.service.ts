import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { CreateAirportDto } from 'src/modules/airport/dto/create-airport.dto';
import { UpdateAirportDto } from 'src/modules/airport/dto/update-airport.dto';
import { Airport } from 'src/modules/airport/entity/airport.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AirportService {
  constructor(
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
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
    return await this.airportRepository.find();
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
    if (updateAirportDto.airportCode) {
      const isExist = await this.airportRepository.findOne({
        where: {
          airportCode: updateAirportDto.airportCode,
        },
      });
      if (isExist) {
        return {
          code: 400,
          message: 'Airport already exists',
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
    return await this.airportRepository.findOneBy({ id });
  }
}
