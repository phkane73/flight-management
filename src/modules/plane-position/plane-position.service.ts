import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { CreatePlanePositionDto } from 'src/modules/plane-position/dto/create-plane-position.dto';
import { MovePlaneDto } from 'src/modules/plane-position/dto/move-plane.dto';
import { UpdatePlanePositionDto } from 'src/modules/plane-position/dto/update-plane-position.dto';
import { PlanePosition } from 'src/modules/plane-position/entity/plane-position.entity';
import { PlaneService } from 'src/modules/plane/plane.service';
import { Repository } from 'typeorm';

@Injectable()
export class PlanePositionService {
  constructor(
    @InjectRepository(PlanePosition)
    private planePositionRepository: Repository<PlanePosition>,
    private readonly airportService: AirportService,
    private readonly planeService: PlaneService,
  ) {}

  async addPlanePosition(
    createPlanePositionDto: CreatePlanePositionDto,
  ): Promise<Response<PlanePosition>> {
    const { airportId, planeId, startTime } = createPlanePositionDto;
    try {
      const airport = await this.airportService.findAirportById(airportId);
      const plane = await this.planeService.findPlaneById(planeId);
      const currentQuantityPlane = await this.planePositionRepository.count({
        where: { airport, endTime: null },
      });
      if (currentQuantityPlane >= airport.maxLoad) {
        return {
          code: 400,
          message: 'The airport is at full capacity. Cannot add more planes.',
        };
      }
      const planePosition = this.planePositionRepository.create({
        airport,
        plane,
        startTime,
        endTime: null,
      });
      const result = await this.planePositionRepository.save(planePosition);
      return {
        code: 200,
        message: 'Plane position added successfully',
        data: result,
      };
    } catch (error) {
      return {
        code: 400,
        message: error.message,
      };
    }
  }

  async updatePlanePosition(
    updatePlanePositionDto: UpdatePlanePositionDto,
  ): Promise<Response<PlanePosition>> {
    const { id, airportId, planeId, startTime } = updatePlanePositionDto;
    const planePositionExist = await this.planePositionRepository.findOneBy({ id });
    if (planePositionExist.endTime) {
      return {
        code: 400,
        message: 'End time of plane position already exists. Update not impossible.',
      };
    }

    const airport = await this.airportService.findAirportById(airportId);
    const currentQuantityPlane = await this.planePositionRepository.count({
      where: { airport, endTime: null },
    });
    if (currentQuantityPlane >= airport?.maxLoad) {
      return {
        code: 400,
        message: 'The airport is at full capacity. Cannot add more planes.',
      };
    }
    const plane = await this.planeService.findPlaneById(planeId);
    if (plane) {
      const isPlanePosition = await this.planePositionRepository.findOne({
        where: { plane, endTime: null },
      });
      if (isPlanePosition) {
        return {
          code: 400,
          message: 'Plane has been positioned',
        };
      }
    }
    await this.planePositionRepository.update(id, { startTime, airport, plane, endTime: null });
    return {
      code: 200,
      message: 'Update plane position successfully',
    };
  }

  async getAllPlanePosition(): Promise<PlanePosition[]> {
    return this.planePositionRepository.find({
      relations: {
        airport: true,
        plane: true,
      },
    });
  }

  async getAllPlaneAtAirport(airportId: number) {
    const planePositionList = await this.planePositionRepository.find({
      where: {
        airport: {
          id: airportId,
        },
        endTime: null,
      },
      relations: {
        plane: true,
      },
    });
    const allPlaneAtAirport = planePositionList.map((item) => item.plane);
    return allPlaneAtAirport;
  }

  async movePlane(movePlaneDto: MovePlaneDto) {
    const { planeId, airportId } = movePlaneDto;
    const plane = await this.planeService.findPlaneById(planeId);
    const airport = await this.airportService.findAirportById(airportId);
  }
}

