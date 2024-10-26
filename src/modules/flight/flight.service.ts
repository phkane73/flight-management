import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { Airport } from 'src/modules/airport/entity/airport.entity';
import { FlightRoute } from 'src/modules/flight-route/entity/flight-route.entity';
import { FlightRouteService } from 'src/modules/flight-route/flight-route.service';
import { GenerateFlightDto } from 'src/modules/flight/dto/generate-flight.dto';
import { Flight } from 'src/modules/flight/entity/flight.entity';
import { PlanePositionService } from 'src/modules/plane-position/plane-position.service';
import { Plane } from 'src/modules/plane/entity/plane.entity';
import { PlaneService } from 'src/modules/plane/plane.service';
import { Repository } from 'typeorm';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    private readonly flightRouteService: FlightRouteService,
    private readonly planeService: PlaneService,
    private readonly planePositionService: PlanePositionService,
    private readonly airportService: AirportService,
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
  ) {
    let lastTimeFlights = new Date(startFlightScheduleTime.getTime());
    const flights: Flight[] = [];
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
          flights,
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
        const result = await this.flightRepository.save(flight);
        flights.push(result);
      }
    }
    return {
      time: lastTimeFlights,
      flights,
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
  ): Promise<{ time: Date; flights: Flight[]; shouldStop: boolean }> {
    const { time, flights } = await this.handleFlightCreation(
      flightRoute,
      airport,
      handleScheduleTime,
      endFlightScheduleTime,
      planesToAssign,
    );
    const shouldStop = time.getTime() >= endFlightScheduleTime.getTime();
    return { time, flights, shouldStop };
  }

  private async processFlightsForAirports(
    airports: Airport[],
    flightRoutesMap: Map<number, FlightRoute[]>,
    initialScheduleTime: Date,
    endFlightScheduleTime: Date,
    flightSchedule: Flight[],
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
        const { time, flights, shouldStop } = await this.createFlightsForRoute(
          flightRoute,
          airport,
          updatedScheduleTime,
          endFlightScheduleTime,
          planesToAssign,
        );

        flightSchedule.push(...flights);
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

  async generateFlights(generateFlightDto: GenerateFlightDto): Promise<Response<Flight[]>> {
    const { startFlightScheduleTime, endFlightScheduleTime } = generateFlightDto;
    const flightSchedule: Flight[] = [];
    let initialScheduleTime: Date = startFlightScheduleTime;
    const [airports, planes] = await this.loadOperatingAirportsAndPlanes();

    if (airports.length === 0 || planes.length === 0) {
      throw new HttpException('No airport or plane found', HttpStatus.BAD_REQUEST);
    }

    const flightRoutesMap = await this.initializeFlightRoutesMap(airports);
    while (initialScheduleTime < endFlightScheduleTime) {
      const { updatedScheduleTime, stop } = await this.processFlightsForAirports(
        airports,
        flightRoutesMap,
        initialScheduleTime,
        endFlightScheduleTime,
        flightSchedule,
      );

      initialScheduleTime = updatedScheduleTime;
      if (stop) break;
    }

    return {
      code: 200,
      message: 'Generate flights successfully',
      data: flightSchedule,
    };
  }
}
