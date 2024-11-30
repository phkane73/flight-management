import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kafka } from 'kafkajs';
import { Response } from 'src/common/interface/error.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { Airport } from 'src/modules/airport/entity/airport.entity';
import { FlightRoute } from 'src/modules/flight-route/entity/flight-route.entity';
import { FlightRouteService } from 'src/modules/flight-route/flight-route.service';
import { FlightSchedule } from 'src/modules/flight-schedule/entity/flight-schedule.entity';
import { FlightScheduleService } from 'src/modules/flight-schedule/flight-schedule.service';
import { FlightDto } from 'src/modules/flight/dto/flight.dto';
import { GenerateFlightDto } from 'src/modules/flight/dto/generate-flight.dto';
import { Flight } from 'src/modules/flight/entity/flight.entity';
import { PlanePositionService } from 'src/modules/plane-position/plane-position.service';
import { Plane } from 'src/modules/plane/entity/plane.entity';
import { PlaneService } from 'src/modules/plane/plane.service';
import { RunwayTypeEnum } from 'src/modules/runway/enum/runway-type.enum';
import { RunwayService } from 'src/modules/runway/runway.service';
import { Repository } from 'typeorm';
@Injectable()
export class FlightService {
  private readonly kafka = new Kafka({
    clientId: 'flight-management',
    brokers: ['localhost:9092'],
  });

  private readonly producer = this.kafka.producer();

  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    private readonly flightRouteService: FlightRouteService,
    private readonly planeService: PlaneService,
    private readonly planePositionService: PlanePositionService,
    private readonly airportService: AirportService,
    private readonly flightScheduleService: FlightScheduleService,
    private readonly runwayService: RunwayService,
  ) {}

  private generateFlightCode(planeName: string): string {
    const prefix = 'SKY';
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);
    const randomNumber = Math.floor(Math.random() * 900) + 100;
    return `${prefix}${day}${month}${year}${randomNumber}${planeName}`;
  }

  private async handleFlightCreation(
    flightRoute: FlightRoute,
    airport: Airport,
    startFlightScheduleTime: Date,
    endFlightScheduleTime: Date,
    planesToAssign: Plane[],
    flightSchedule: FlightSchedule,
  ) {
    let lastTimeFlights = new Date(startFlightScheduleTime.getTime());
    const listFlight: Flight[] = [];
    for (const plane of planesToAssign) {
      const resultMovePlane = await this.planePositionService.movePlane({
        airportId:
          flightRoute.departureAirport.id === airport.id
            ? flightRoute.arrivalAirport.id
            : flightRoute.departureAirport.id,
        planeId: plane.id,
        takeOffTime: startFlightScheduleTime,
        endTimeFlightSchedule: endFlightScheduleTime,
      });

      if (resultMovePlane.code === 422) {
        return {
          time: endFlightScheduleTime,
          listFlight,
        };
      }

      if (resultMovePlane.code === 400) {
        throw new HttpException(resultMovePlane.message, HttpStatus.BAD_REQUEST);
      }

      if (resultMovePlane.code === 200) {
        const flight: Flight = new Flight();
        flight.plane = resultMovePlane.data.plane;
        flight.departureTime = resultMovePlane.endTime;
        flight.arrivalTime = resultMovePlane.data.startTime;
        flight.arrivalAirport = resultMovePlane.data.airport;
        flight.departureAirport = airport;
        flight.flightCode = this.generateFlightCode(flight.plane.planeName);
        flight.flightSchedule = flightSchedule;
        const result = await this.flightRepository.save(flight);
        listFlight.push(result);
      }
    }
    return {
      time: lastTimeFlights,
      listFlight,
    };
  }

  private async initializeFlightRoutesMap(
    airports: Airport[],
  ): Promise<Map<number, FlightRoute[]>> {
    const flightRoutesMap = new Map<number, FlightRoute[]>();
    await Promise.all(
      airports.map(async (airport) => {
        const flightRoutes = await this.flightRouteService.getFlightRouteByAirportId(airport.id);
        if (flightRoutes.length > 0) {
          flightRoutesMap.set(airport.id, flightRoutes);
        }
      }),
    );
    return flightRoutesMap;
  }

  private async loadOperatingAirportsAndPlanes(): Promise<[Airport[], Plane[]]> {
    return Promise.all([
      this.airportService.getAirportIsOperating(),
      this.planeService.getPlaneIsOperating(),
    ]);
  }

  private calculatePlanesPerRoute(totalPlanes: number, totalRoutes: number): number {
    if (totalRoutes === 0) return 0;
    return Math.floor(totalPlanes / totalRoutes);
  }
  private assignPlanesToFlightRoutes(planes: Plane[], flightRoutes: FlightRoute[]): Plane[] {
    const planesPerRoute = this.calculatePlanesPerRoute(planes.length, flightRoutes.length);
    return planes.slice(0, planesPerRoute);
  }

  private async createFlightsForRoute(
    flightRoute: FlightRoute,
    airport: Airport,
    handleScheduleTime: Date,
    endFlightScheduleTime: Date,
    planesToAssign: Plane[],
    flightSchedule: FlightSchedule,
  ): Promise<{ time: Date; listFlight: Flight[]; shouldStop: boolean }> {
    const { time, listFlight } = await this.handleFlightCreation(
      flightRoute,
      airport,
      handleScheduleTime,
      endFlightScheduleTime,
      planesToAssign,
      flightSchedule,
    );
    const shouldStop = time.getTime() >= endFlightScheduleTime.getTime();
    return { time, listFlight, shouldStop };
  }

  private async processFlightsForAirports(
    airports: Airport[],
    flightRoutesMap: Map<number, FlightRoute[]>,
    initialScheduleTime: Date,
    endFlightScheduleTime: Date,
    flights: Flight[],
    flightSchedule: FlightSchedule,
  ): Promise<{ updatedScheduleTime: Date; stop: boolean }> {
    let stop = false;
    let updatedScheduleTime = new Date(initialScheduleTime.getTime());

    for (const airport of airports) {
      const flightRoutesOfAirport = flightRoutesMap.get(airport.id);
      for (const flightRoute of flightRoutesOfAirport) {
        const planesOfAirport = await this.planePositionService.getAllPlaneAtAirport(airport.id);
        if (!planesOfAirport || planesOfAirport.length === 0) {
          break;
        }
        const planesToAssign = this.assignPlanesToFlightRoutes(
          planesOfAirport,
          flightRoutesOfAirport,
        );
        const { time, listFlight, shouldStop } = await this.createFlightsForRoute(
          flightRoute,
          airport,
          updatedScheduleTime,
          endFlightScheduleTime,
          planesToAssign,
          flightSchedule,
        );

        flights.push(...listFlight);
        updatedScheduleTime = new Date(time.getTime());

        if (shouldStop) {
          stop = true;
          break;
        }
      }

      if (stop) break;
    }

    return { updatedScheduleTime, stop };
  }

  async checkRunwayOperatingOfAirports(airports: Airport[]): Promise<string> {
    for (const airport of airports) {
      const [runwayLanding, runwayTakeOff] = await Promise.all([
        this.runwayService.getRunwaysByAirportAndType(airport.id, RunwayTypeEnum.Landing),
        this.runwayService.getRunwaysByAirportAndType(airport.id, RunwayTypeEnum.TakeOff),
      ]);

      if (runwayLanding.length < 1) {
        return `${airport.airportName} does not have enough runway for landing`;
      } else if (runwayTakeOff.length < 1) {
        return `${airport.airportName} does not have enough runway for takeoff`;
      }
    }
    return null;
  }

  async generateFlights(generateFlightDto: GenerateFlightDto): Promise<Response<Flight[]>> {
    const { startFlightScheduleTime, endFlightScheduleTime } = generateFlightDto;
    const flights: Flight[] = [];
    let initialScheduleTime: Date = startFlightScheduleTime;
    const [airports, planes] = await this.loadOperatingAirportsAndPlanes();

    if (airports.length < 2) {
      throw new HttpException('List of airports operating fewer than two', HttpStatus.BAD_REQUEST);
    }
    if (planes.length === 0) {
      throw new HttpException('No plane is operating', HttpStatus.BAD_REQUEST);
    }

    const checkRunwayBefore = await this.checkRunwayOperatingOfAirports(airports)
    if (checkRunwayBefore) {
      throw new HttpException(checkRunwayBefore, HttpStatus.BAD_REQUEST);
    }

    await this.runwayService.resetAvailableTimes();
    const flightSchedule = await this.flightScheduleService.createFlightSchedule({
      startTimeSchedule: startFlightScheduleTime,
      endTimeSchedule: endFlightScheduleTime,
    });

    if (!flightSchedule) {
      throw new HttpException(
        'Flight schedules overlapping. Please check start time and end time of the schedule',
        HttpStatus.BAD_REQUEST,
      );
    }
    const flightRoutesMap = await this.initializeFlightRoutesMap(airports);
    while (initialScheduleTime < endFlightScheduleTime) {
      const { updatedScheduleTime, stop } = await this.processFlightsForAirports(
        airports,
        flightRoutesMap,
        initialScheduleTime,
        endFlightScheduleTime,
        flights,
        flightSchedule,
      );

      initialScheduleTime = updatedScheduleTime;
      if (stop) break;
    }

    return {
      code: 200,
      message: 'Generate flights successfully',
      data: flights,
    };
  }

  async getAllFlightByFlightScheduleId(id: number): Promise<Flight[]> {
    return this.flightRepository.find({
      where: { flightSchedule: { id } },
      relations: { departureAirport: true, arrivalAirport: true, plane: true },
      order: { departureTime: 'ASC' },
    });
  }

  async checkFlightIsExist(flightDto: FlightDto): Promise<Flight> {
    const { arrivalAirportId, departureAirportId, departureTime } = flightDto;
    const dateOnly = departureTime.toISOString().split('T')[0];

    const result = await this.flightRepository
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.flightSchedule', 'flightSchedule')
      .where('flight.departureAirportId = :departureAirportId', { departureAirportId })
      .andWhere('flight.arrivalAirportId = :arrivalAirportId', { arrivalAirportId })
      .andWhere('DATE(flight.departureTime) = :dateOnly', { dateOnly })
      .andWhere('flightSchedule.approved = :approved', { approved: true })
      .getOne();
    return result;
  }

  async findFlights(id: number): Promise<{ data: Flight[]; price: string }> {
    const flight = await this.flightRepository.findOne({
      where: { id },
      relations: { departureAirport: true, arrivalAirport: true },
    });
    const { departureAirport, arrivalAirport, departureTime } = flight;
    const departureAirportId = departureAirport.id;
    const arrivalAirportId = arrivalAirport.id;
    const [flights, price] = await Promise.all([
      this.flightRepository
        .createQueryBuilder('flight')
        .leftJoinAndSelect('flight.departureAirport', 'departureAirport')
        .leftJoinAndSelect('flight.arrivalAirport', 'arrivalAirport')
        .leftJoinAndSelect('flight.plane', 'plane')
        .where('flight.departureAirportId = :departureAirportId', { departureAirportId })
        .andWhere('flight.arrivalAirportId = :arrivalAirportId', { arrivalAirportId })
        .andWhere('DATE(flight.departureTime) = :departureTime', { departureTime })
        .getMany(),
      this.flightRouteService.getPriceOfFlight(departureAirportId, arrivalAirportId),
    ]);
    return { data: flights, price };
  }

  async approveFlightSchedule(id: number): Promise<Response<FlightSchedule>> {
    const updateResult = await this.flightScheduleService.approve(id);
    if (updateResult) {
      const flightsOfFlightSchedule = (await this.getAllFlightByFlightScheduleId(id)).map(
        (item) => item.id,
      );
      await this.sendApprovedFlights(flightsOfFlightSchedule);
      return {
        code: 200,
        message: 'Approve flight schedule successfully',
      };
    }
  }

  async sendApprovedFlights(flightListIds: number[]) {
    const flightDtos = flightListIds.map((flightId) => ({
      flightId: flightId,
    }));
    await this.producer.connect();
    flightDtos.forEach(async (item) => {
      await this.producer.send({
        topic: 'approvedFlights',
        messages: [
          {
            value: JSON.stringify(item),
          },
        ],
      });
      await this.producer.disconnect();
    });
  }

  async getFlightById(id: number) {
    const flight = await this.flightRepository.findOne({
      where: { id },
      relations: {
        departureAirport: true,
        arrivalAirport: true,
      },
    });
    const price = await this.flightRouteService.getPriceOfFlight(
      flight.departureAirport.id,
      flight.arrivalAirport.id,
    );
    return { flight, price };
  }

  async getFlightByIds(ids: number[]) {
    const uniqueIds = Array.from(new Set(ids));
    const flights: Flight[] = [];
    for (const id of uniqueIds) {
      const flight = await this.flightRepository.findOne({
        where: { id },
        relations: {
          departureAirport: true,
          arrivalAirport: true,
          plane: true,
        },
      });
      if (flight) flights.push(flight);
    }
    return flights;
  }
}
