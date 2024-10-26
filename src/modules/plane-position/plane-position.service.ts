import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { Pagination } from 'src/common/interface/pagination.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { Airport } from 'src/modules/airport/entity/airport.entity';
import { FlightRoute } from 'src/modules/flight-route/entity/flight-route.entity';
import { FlightRouteService } from 'src/modules/flight-route/flight-route.service';
import { CreatePlanePositionDto } from 'src/modules/plane-position/dto/create-plane-position.dto';
import { MovePlaneDto } from 'src/modules/plane-position/dto/move-plane.dto';
import { SearchPlanePositionDto } from 'src/modules/plane-position/dto/search-plane-position.dto';
import { UpdatePlanePositionDto } from 'src/modules/plane-position/dto/update-plane-position.dto';
import { PlanePosition } from 'src/modules/plane-position/entity/plane-position.entity';
import { PlaneService } from 'src/modules/plane/plane.service';
import { Runway } from 'src/modules/runway/entity/runway.entity';
import { RunwayTypeEnum } from 'src/modules/runway/enum/runway-type.enum';
import { RunwayService } from 'src/modules/runway/runway.service';
import { Repository } from 'typeorm';
@Injectable()
export class PlanePositionService {
  constructor(
    @InjectRepository(PlanePosition)
    private readonly planePositionRepository: Repository<PlanePosition>,
    private readonly airportService: AirportService,
    private readonly planeService: PlaneService,
    private readonly flightRouteService: FlightRouteService,
    private readonly runwayService: RunwayService,
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

  async deletePlanePosition(id: number): Promise<Response<PlanePosition>> {
    await this.planePositionRepository.delete(id);
    return {
      code: 200,
      message: 'Delete plane position successfully',
    };
  }

  async getAllPlaneAtAirport(airportId: number) {
    const planePositionList = await this.planePositionRepository.find({
      where: {
        thePlaneTookOff: false,
        airport: {
          id: airportId,
        },
        plane: {
          isOperating: true,
        },
      },
      relations: {
        plane: true,
      },
      order: {
        startTime: 'ASC',
      },
    });
    const allPlaneAtAirport = planePositionList.map((item) => item.plane);
    return allPlaneAtAirport;
  }

  private async checkPlaneAndAirportStatus(
    planeId: number,
    airportId: number,
  ): Promise<Response<Airport>> {
    const [airport, allPlaneAtAirport] = await Promise.all([
      this.airportService.findAirportById(airportId),
      this.getAllPlaneAtAirport(airportId),
    ]);
    if (allPlaneAtAirport.some((item) => item.id === planeId)) {
      return { code: 400, message: 'The plane is currently at the airport' };
    }

    if (airport?.maxLoad <= allPlaneAtAirport.length) {
      return { code: 400, message: 'Airport full position' };
    }

    return { code: 200, message: 'Check plane and airport successfully', data: airport };
  }

  private async checkPlanePosition(planeId: number): Promise<Response<PlanePosition>> {
    const isPlanePosition = await this.planePositionRepository.findOne({
      where: { plane: { id: planeId }, thePlaneTookOff: false },
      relations: { airport: true },
    });

    if (!isPlanePosition) {
      return { code: 400, message: 'The plane is not in position yet' };
    }

    return { code: 200, message: 'Check plane position successfully', data: isPlanePosition };
  }

  private async checkFlightRoute(
    departureAirportId: number,
    arrivalAirportId: number,
  ): Promise<Response<FlightRoute>> {
    const flightRoute = await this.flightRouteService.getFlightRouteByAirport(
      departureAirportId,
      arrivalAirportId,
    );

    if (!flightRoute) {
      return { code: 400, message: 'Flight route does not exist' };
    }

    return { code: 200, message: 'Check flight route successfully', data: flightRoute };
  }

  private calculateNewTimes(
    isPlanePosition: PlanePosition,
    takeOffTime: Date,
    flightRouteEstTime: number,
  ): { endTime: Date; newPlanePositionStartTime: Date } {
    const endTime =
      takeOffTime > new Date(isPlanePosition.startTime.getTime() + 3600000)
        ? takeOffTime
        : new Date(isPlanePosition.startTime.getTime() + 3600000);

    const newPlanePositionStartTime = new Date(endTime.getTime() + + flightRouteEstTime);

    return { endTime, newPlanePositionStartTime };
  }

  private async getAvailableRunways(
    airportId: number,
    endTime: Date,
    type: RunwayTypeEnum,
  ): Promise<Runway> {
    const runways = await this.runwayService.getRunwaysByAirportAndType(airportId, type);
    const availableRunway = runways.find(
      (item) => item.availableTime === null || item.availableTime < endTime,
    );
    return availableRunway;
  }

  async movePlane(movePlaneDto: MovePlaneDto): Promise<Response<PlanePosition>> {
    const { planeId, airportId, takeOffTime, endTimeFlightSchedule } = movePlaneDto;

    const runwayCheck = await this.runwayService.checkRunwayAvailableBefore(takeOffTime);
    if (runwayCheck) {
      return { code: 400, message: 'No Runway available before take off time' };
    }
      const planeAirportStatus = await this.checkPlaneAndAirportStatus(planeId, airportId);
    if (planeAirportStatus.code !== 200) {
      return { code: planeAirportStatus.code, message: planeAirportStatus.message };
    }

    const planePosition = await this.checkPlanePosition(planeId);
    if (planePosition.code !== 200) {
      return { code: planePosition.code, message: planePosition.message };
    }

    if (!endTimeFlightSchedule && takeOffTime < planePosition.data.startTime) {
      return { code: 400, message: 'Take off time invalid' };
    }

    const flightRoute = await this.checkFlightRoute(planePosition.data.airport.id, airportId);
    if (flightRoute.code !== 200) {
      return { code: flightRoute.code, message: flightRoute.message };
    }

    const { endTime, newPlanePositionStartTime } = this.calculateNewTimes(
      planePosition.data,
      takeOffTime,
      flightRoute.data.flightRouteEstTime,
    );

    if (endTimeFlightSchedule && newPlanePositionStartTime > endTimeFlightSchedule) {
      return { code: 422, message: 'Over time of flight schedule' };
    }

    let runwayDeparture = await this.getAvailableRunways(
      planePosition.data.airport.id,
      endTime,
      RunwayTypeEnum.TakeOff,
    );

    while (!runwayDeparture && endTime < endTimeFlightSchedule) {
      endTime.setMinutes(endTime.getMinutes() + 5);
      newPlanePositionStartTime.setMinutes(newPlanePositionStartTime.getMinutes() + 5);
      runwayDeparture = await this.getAvailableRunways(
        planePosition.data.airport.id,
        endTime,
        RunwayTypeEnum.TakeOff,
      );
    }

    let runwayArrival = await this.getAvailableRunways(
      airportId,
      newPlanePositionStartTime,
      RunwayTypeEnum.Landing,
    );

    while (!runwayArrival && newPlanePositionStartTime < endTimeFlightSchedule) {
      newPlanePositionStartTime.setMinutes(newPlanePositionStartTime.getMinutes() + 5);
      endTime.setMinutes(endTime.getMinutes() + 5);
      runwayArrival = await this.getAvailableRunways(
        airportId,
        newPlanePositionStartTime,
        RunwayTypeEnum.Landing,
      );
    }

    if (!runwayDeparture || !runwayArrival) {
      return { code: 400, message: 'There is no runway available' };
    }

    await this.updatePlanePosition({ id: planePosition.data.id, endTime, thePlaneTookOff: true });

    await this.runwayService.updateRunway({
      id: runwayDeparture.id,
      availableTime: endTime,
    });

    const newPlanePosition = await this.addPlanePosition({
      airportId,
      planeId,
      startTime: newPlanePositionStartTime,
    });

    await this.runwayService.updateRunway({
      id: runwayArrival.id,
      availableTime: newPlanePositionStartTime,
    });

    if (newPlanePosition.code === 200) {
      return {
        code: 200,
        message: 'Move plane successfully',
        data: newPlanePosition.data,
        endTime,
      };
    }
    return { code: 400, message: 'Error. Move plane fail' };
  }
}
