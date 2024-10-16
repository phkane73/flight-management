import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { Pagination } from 'src/common/interface/pagination.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { FlightRouteService } from 'src/modules/flight-route/flight-route.service';
import { CreatePlanePositionDto } from 'src/modules/plane-position/dto/create-plane-position.dto';
import { MovePlaneDto } from 'src/modules/plane-position/dto/move-plane.dto';
import { SearchPlanePositionDto } from 'src/modules/plane-position/dto/search-plane-position.dto';
import { UpdatePlanePositionDto } from 'src/modules/plane-position/dto/update-plane-position.dto';
import { PlanePosition } from 'src/modules/plane-position/entity/plane-position.entity';
import { PlaneService } from 'src/modules/plane/plane.service';
import { Repository } from 'typeorm';
@Injectable()
export class PlanePositionService {
  constructor(
    @InjectRepository(PlanePosition)
    private readonly planePositionRepository: Repository<PlanePosition>,
    private readonly airportService: AirportService,
    private readonly planeService: PlaneService,
    private readonly flightRouteService: FlightRouteService,
  ) {}

  async addPlanePosition(
    createPlanePositionDto: CreatePlanePositionDto,
  ): Promise<Response<PlanePosition>> {
    const { airportId, planeId, startTime } = createPlanePositionDto;
    try {
      const [airport, plane, isPlanePosition, allPlaneAtAirport] = await Promise.all([
        this.airportService.findAirportById(airportId),
        this.planeService.findPlaneById(planeId),
        this.planePositionRepository.findOne({
          where: {
            plane: {
              id: planeId,
            },
            thePlaneTookOff: false,
          },
        }),
        this.getAllPlaneAtAirport(airportId),
      ]);

      if (isPlanePosition) {
        return {
          code: 400,
          message: 'Plane has been positioned',
        };
      }
      if (airport.maxLoad <= allPlaneAtAirport.length) {
        return {
          code: 400,
          message: 'Airport full position',
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
    const { id, airportId, planeId, startTime, endTime, thePlaneTookOff } = updatePlanePositionDto;

    const [planePosition, airport, plane, allPlaneAtAirport] = await Promise.all([
      this.planePositionRepository.findOne({
        where: { id },
        relations: { airport: true, plane: true },
      }),
      this.airportService.findAirportById(airportId),
      this.planeService.findPlaneById(planeId),
      this.getAllPlaneAtAirport(airportId),
    ]);
    if (!planePosition) {
      return {
        code: 400,
        message: 'Plane Position do not exist',
      };
    }
    if (airportId !== planePosition.airport.id && airport?.maxLoad <= allPlaneAtAirport.length) {
      return {
        code: 400,
        message: 'Airport full position',
      };
    }
    if (plane && planeId !== planePosition.plane.id) {
      const isPlanePosition = await this.planePositionRepository.findOne({
        where: { plane, thePlaneTookOff: false },
      });
      if (isPlanePosition) {
        return {
          code: 400,
          message: 'Plane has been positioned',
        };
      }
    }
    await this.planePositionRepository.update(id, {
      startTime,
      airport,
      plane,
      endTime,
      thePlaneTookOff,
    });
    return {
      code: 200,
      message: 'Update plane position successfully',
    };
  }

  // async getAllPlanePosition(searchPlanePosition: SearchPlanePositionDto): Promise<PlanePosition[]> {
  //   return this.planePositionRepository.find({
  //     relations: {
  //       airport: true,
  //       plane: true,
  //     },
  //     order: {
  //       startTime: 'DESC',
  //     },
  //   });
  // }

  async getPlanesHaveNoPosition() {
    const [planes, planePositionList] = await Promise.all([
      this.planeService.getAllPlane(),
      this.planePositionRepository.find({
        relations: {
          plane: true,
        },
      }),
    ]);
    const planeList = new Set(planePositionList.map((item) => item.plane.id));
    const planesWithoutPosition = planes.filter((plane) => !planeList.has(plane.id));
    return planesWithoutPosition;
  }

  async getAllPlanePosition(
    searchPlanePosition: SearchPlanePositionDto,
  ): Promise<Pagination<PlanePosition>> {
    const { page, limit, airportCode, planeName, thePlaneTookOff } = searchPlanePosition;
    const queryBuilder = this.planePositionRepository
      .createQueryBuilder('planePosition')
      .leftJoinAndSelect('planePosition.airport', 'airport')
      .leftJoinAndSelect('planePosition.plane', 'plane')
      .orderBy('planePosition.startTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (airportCode) {
      queryBuilder.andWhere('airport.airportCode ILIKE :airportCode', {
        airportCode: `%${airportCode}%`,
      });
    }

    if (planeName) {
      queryBuilder.andWhere('plane.planeName ILIKE :planeName', { planeName: `%${planeName}%` });
    }

    if (thePlaneTookOff !== undefined) {
      queryBuilder.andWhere('planePosition.thePlaneTookOff = :thePlaneTookOff', {
        thePlaneTookOff,
      });
    }

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      data: result,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllPlaneAtAirport(airportId: number) {
    const planePositionList = await this.planePositionRepository.find({
      where: {
        thePlaneTookOff: false,
        airport: {
          id: airportId,
        },
      },
      relations: {
        plane: true,
      },
    });
    const allPlaneAtAirport = planePositionList.map((item) => item.plane);
    return allPlaneAtAirport;
  }

  async movePlane(movePlaneDto: MovePlaneDto): Promise<Response<PlanePosition>> {
    const { planeId, airportId } = movePlaneDto;
    const [airport, allPlaneAtAirport] = await Promise.all([
      this.airportService.findAirportById(airportId),
      this.getAllPlaneAtAirport(airportId),
    ]);
    if (allPlaneAtAirport.some((item) => item.id === planeId)) {
      return {
        code: 400,
        message: 'The plane is currently at the airport',
      };
    }
    if (airport?.maxLoad <= allPlaneAtAirport.length) {
      return {
        code: 400,
        message: 'Airport full position',
      };
    }
    const isPlanePosition = await this.planePositionRepository.findOne({
      where: { plane: { id: planeId }, thePlaneTookOff: false },
      relations: {
        airport: true,
      },
    });
    if (!isPlanePosition) {
      return {
        code: 400,
        message: 'The plane is not in position yet',
      };
    }
    const flightRoute = await this.flightRouteService.getFlightRouteByAirport(
      airportId,
      isPlanePosition.airport.id,
    );
    if (!flightRoute) {
      return {
        code: 400,
        message: 'Flight route do not exist',
      };
    }
    const endTime = new Date(isPlanePosition.startTime.getTime() + 3600000);

    const updateResult = await this.updatePlanePosition({
      id: isPlanePosition.id,
      endTime,
      thePlaneTookOff: true,
    });
    if (updateResult.code === 200) {
      const newPlanePositionStartTime = new Date(
        endTime.getTime() + +flightRoute.flightRouteEstTime,
      );
      const newPlanePosition = await this.addPlanePosition({
        airportId,
        planeId,
        startTime: newPlanePositionStartTime,
      });
      if (newPlanePosition.code === 200) {
        return {
          code: 200,
          message: 'Successfully',
        };
      }
    }
    return {
      code: 400,
      message: 'Error. Move plane fail',
    };
  }
}
