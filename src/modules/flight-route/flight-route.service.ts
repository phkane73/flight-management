import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { AirportService } from 'src/modules/airport/airport.service';
import { CreateFlightRouteDto } from 'src/modules/flight-route/dto/create-flight-route.dto';
import { UpdateFlightRouteDto } from 'src/modules/flight-route/dto/update-flight-route.dto';
import { FlightRoute } from 'src/modules/flight-route/entity/flight-route.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FlightRouteService {
  constructor(
    @InjectRepository(FlightRoute)
    private readonly flightRouteRepository: Repository<FlightRoute>,
    private readonly airportService: AirportService,
  ) {}

  async addFlightRoute(createFlightRouteDto: CreateFlightRouteDto): Promise<Response<FlightRoute>> {
    const { flightRouteEstTime, flightRoutePrice, departureAirportId, arrivalAirportId } =
      createFlightRouteDto;
    const flightRouteList = await this.flightRouteRepository.find({
      relations: {
        departureAirport: true,
        arrivalAirport: true,
      },
    });
    const isExistFlightRoute = flightRouteList.find(
      (item) =>
        (item.departureAirport.id === departureAirportId &&
          item.arrivalAirport.id === arrivalAirportId) ||
        (item.departureAirport.id === arrivalAirportId &&
          item.arrivalAirport.id === departureAirportId),
    );
    if (isExistFlightRoute) {
      return {
        code: 400,
        message: 'Flight Route already exist',
      };
    }
    try {
      const departureAirport = await this.airportService.findAirportById(departureAirportId);
      const arrivalAirport = await this.airportService.findAirportById(arrivalAirportId);
      const newFlightRoute = this.flightRouteRepository.create({
        flightRouteEstTime,
        flightRoutePrice,
        departureAirport,
        arrivalAirport,
      });
      await this.flightRouteRepository.save(newFlightRoute);
      return {
        code: 200,
        message: 'Add flight route successfully',
      };
    } catch (error) {
      return {
        code: 400,
        message: error.message,
      };
    }
  }

  async deleteFlightRoute(id: number): Promise<Response<FlightRoute>> {
    await this.flightRouteRepository.delete(id);
    return {
      code: 200,
      message: 'Delete flight route successfully',
    };
  }

  async getFlightRouteIsOperating() {
    return this.flightRouteRepository.findBy({ isOperating: true });
  }

  async getAllFlightRoute() {
    return this.flightRouteRepository.find({
      relations: {
        departureAirport: true,
        arrivalAirport: true,
      },
    });
  }

  async getFlightRouteById(id: number) {
    return this.flightRouteRepository.findOne({
      where: { id },
      relations: {
        departureAirport: true,
        arrivalAirport: true,
      },
    });
  }

  async getFlightRouteByAirportId(airportId: number) {
    return this.flightRouteRepository.find({
      where: [
        {
          arrivalAirport: { id: airportId, isOperating: true },
          departureAirport: { isOperating: true },
          isOperating: true,
        },
        {
          departureAirport: { id: airportId, isOperating: true },
          arrivalAirport: { isOperating: true },
          isOperating: true,
        },
      ],
      relations: {
        departureAirport: true,
        arrivalAirport: true,
      },
      order: {
        flightRouteEstTime: 'ASC'
      }
    });
  }

  async getFlightRouteByAirport(airportId1: number, airportId2: number) {
    const result = await this.flightRouteRepository.findOne({
      where: [
        {
          departureAirport: { id: airportId1, isOperating: true },
          arrivalAirport: { id: airportId2, isOperating: true },
          isOperating: true,
        },
        {
          departureAirport: { id: airportId2, isOperating: true },
          arrivalAirport: { id: airportId1, isOperating: true },
          isOperating: true,
        },
      ],
    });
    return result || null;
  }

  async updateFlightRoute(
    updateFlightRouteDto: UpdateFlightRouteDto,
  ): Promise<Response<FlightRoute>> {
    const {
      id,
      flightRouteEstTime,
      flightRoutePrice,
      departureAirportId,
      arrivalAirportId,
      isOperating,
    } = updateFlightRouteDto;
    const flightRouteList = await this.flightRouteRepository.find({
      relations: {
        departureAirport: true,
        arrivalAirport: true,
      },
    });
    const isExistFlightRoute = flightRouteList.find(
      (item) =>
        (item.departureAirport.id === departureAirportId &&
          item.arrivalAirport.id === arrivalAirportId) ||
        (item.departureAirport.id === arrivalAirportId &&
          item.arrivalAirport.id === departureAirportId),
    );
    if (!isExistFlightRoute) {
      return {
        code: 400,
        message: 'Flight Route not found',
      };
    }
    const [departureAirport, arrivalAirport] = await Promise.all([
      this.airportService.findAirportById(departureAirportId),
      this.airportService.findAirportById(arrivalAirportId),
    ]);
    try {
      await this.flightRouteRepository.update(
        { id },
        { departureAirport, arrivalAirport, flightRouteEstTime, flightRoutePrice, isOperating },
      );
      return {
        code: 200,
        message: 'Update flight route successfully',
      };
    } catch (error) {
      return {
        code: 400,
        message: error.message,
      };
    }
  }

  async getPriceOfFlight(airportId1: number, airportId2: number) {
    const result = await this.flightRouteRepository.findOne({
      where: [
        {
          departureAirport: { id: airportId1, isOperating: true },
          arrivalAirport: { id: airportId2, isOperating: true },
          isOperating: true,
        },
        {
          departureAirport: { id: airportId2, isOperating: true },
          arrivalAirport: { id: airportId1, isOperating: true },
          isOperating: true,
        },
      ],
    });
    return result.flightRoutePrice
  }
}
