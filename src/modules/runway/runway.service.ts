import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { CreateRunwayDto } from 'src/modules/runway/dto/create-runway.dto';
import { UpdateRunwayDto } from 'src/modules/runway/dto/update-runway.dto';
import { Runway } from 'src/modules/runway/entity/runway.entity';
import { RunwayTypeEnum } from 'src/modules/runway/enum/runway-type.enum';
import { IsNull, LessThan, Repository } from 'typeorm';

@Injectable()
export class RunwayService {
  constructor(
    @InjectRepository(Runway)
    private readonly runwayRepository: Repository<Runway>,
    @Inject(forwardRef(() => AirportService))
    private readonly airportService: AirportService,
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

  async updateRunways(updateRunwayDtoList: UpdateRunwayDto[]): Promise<Response<Runway>> {
    await Promise.all(
      updateRunwayDtoList.map(async (updateRunwayDto) => {
        const { id } = updateRunwayDto;
        return this.runwayRepository.update(id, { ...updateRunwayDto });
      }),
    );
    return {
      code: 200,
      message: 'Update runway successfully',
    };
  }

  async checkRunwayAvailableBefore(value: Date) {
    const runway = await this.runwayRepository.findOne({
      where: [{ availableTime: LessThan(value) }, { availableTime: IsNull() }],
    });
    return !runway;
  }

  async updateRunway(updateRunwayDto: UpdateRunwayDto) {
    const { id } = updateRunwayDto;
    const result = await this.runwayRepository.update({ id }, { ...updateRunwayDto });
    return result;
  }

  async resetAvailableTime(id: number) {
    const result = await this.runwayRepository.update({ id }, { availableTime: null });
    if (result) {
      return {
        code: 200,
        message: 'Reset available time successfully',
      };
    }
  }

  async getRunwayByAirportId(airportId: number): Promise<Runway[]> {
    console.log('first')
    return this.runwayRepository.find({
      where: {
        airport: {
          id: airportId,
        },
      },
    });
  }

  async getRunwaysByAirportAndType(airportId: number, type: RunwayTypeEnum): Promise<Runway[]> {
    const runways = await this.runwayRepository.find({
      where: [
        { airport: { id: airportId }, runwayType: type, isOperating: true },
        { airport: { id: airportId }, runwayType: RunwayTypeEnum.All, isOperating: true },
      ],
    });
    return runways;
  }
}
