import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { Pagination } from 'src/common/interface/pagination.interface';
import { CreateFlightScheduleDto } from 'src/modules/flight-schedule/dto/create-flight-schedule.dto';
import { SearchFlightScheduleDto } from 'src/modules/flight-schedule/dto/search-flight-schedule.dto';
import { FlightSchedule } from 'src/modules/flight-schedule/entity/flight-schedule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FlightScheduleService {
  constructor(
    @InjectRepository(FlightSchedule)
    private readonly flightScheduleRepository: Repository<FlightSchedule>,
  ) {}

  async createFlightSchedule(
    createFlightScheduleDto: CreateFlightScheduleDto,
  ): Promise<FlightSchedule> {
    const { startTimeSchedule, endTimeSchedule } = createFlightScheduleDto;
    const existingSchedule = await this.flightScheduleRepository
      .createQueryBuilder('flightSchedule')
      .where(
        '(flightSchedule.startTimeSchedule <= :endTimeSchedule AND flightSchedule.endTimeSchedule >= :startTimeSchedule)',
        { startTimeSchedule, endTimeSchedule },
      )
      .getOne();
    if (existingSchedule) {
      return null;
    }
    return this.flightScheduleRepository.save(createFlightScheduleDto);
  }

  async deleteFlightSchedule(flightScheduleId: number): Promise<Response<FlightSchedule>> {
    const flightSchedule = await this.flightScheduleRepository.findOne({
      where: { id: flightScheduleId },
      relations: {
        flights: true,
      },
    });

    if (!flightSchedule) {
      return {
        code: 400,
        message: 'No found flight schedule',
      };
    }
    await this.flightScheduleRepository.remove(flightSchedule);
    return {
      code: 200,
      message: 'Delete flight schedule successfully',
    };
  }

  async getAllFlightSchedule(
    searchFlightScheduleDto: SearchFlightScheduleDto,
  ): Promise<Pagination<FlightSchedule>> {
    const { page, limit, startTimeSchedule, endTimeSchedule, approved } = searchFlightScheduleDto;
    const queryBuilder = this.flightScheduleRepository
      .createQueryBuilder('flightSchedule')
      .orderBy('flightSchedule.startTimeSchedule', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (startTimeSchedule) {
      queryBuilder.andWhere('flightSchedule.startTimeSchedule >= :startTimeSchedule', {
        startTimeSchedule,
      });
    }

    if (endTimeSchedule) {
      queryBuilder.andWhere('flightSchedule.startTimeSchedule <= :endTimeSchedule', {
        endTimeSchedule,
      });
    }

    if (approved !== undefined) {
      queryBuilder.andWhere('flightSchedule.approved = :approved', { approved });
    }

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      data: result,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async checkApprove(id: number) {
    return this.flightScheduleRepository.findOne({ where: { id, approved: true } });
  }

  async approveFlightSchedule(id: number): Promise<Response<FlightSchedule>> {
    const updateResult = await this.flightScheduleRepository.update({ id }, { approved: true });
    if (updateResult) {
      return {
        code: 200,
        message: 'Approve flight schedule successfully',
      };
    }
  }
}
