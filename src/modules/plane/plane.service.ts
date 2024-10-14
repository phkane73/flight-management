import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/common/interface/error.interface';
import { CreatePlaneDto } from 'src/modules/plane/dto/create-plane.dto';
import { UpdatePlaneDto } from 'src/modules/plane/dto/update-plane.dto';
import { Plane } from 'src/modules/plane/entity/plane.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class PlaneService {
  constructor(
    @InjectRepository(Plane)
    private readonly planeRepository: Repository<Plane>,
  ) {}

  async addPlane(createPlaneDto: CreatePlaneDto): Promise<Response<Plane>> {
    const isExist = await this.planeRepository.findOne({
      where: {
        planeName: ILike(`${createPlaneDto.planeName}`),
      },
    });
    if (isExist) {
      return {
        code: 400,
        message: 'Plane already exists',
      };
    }
    const plane = await this.planeRepository.save(createPlaneDto);
    return {
      code: 200,
      message: 'Create plane successfully',
      data: plane,
    };
  }

  async updatePlane(updatePlaneDto: UpdatePlaneDto): Promise<Response<Plane>> {
    const { id } = updatePlaneDto;
    await this.planeRepository.update(id, { ...updatePlaneDto });
    return {
      code: 200,
      message: 'Update plane successfully',
    };
  }

  async getAllPlane(): Promise<Plane[]> {
    return await this.planeRepository.find();
  }

  async getPlaneIsOperating(): Promise<Plane[]> {
    return await this.planeRepository.findBy({ isOperating: true });
  }

  async findPlaneById(id: number): Promise<Plane> {
    if (id) return await this.planeRepository.findOneBy({ id });
  }
}
