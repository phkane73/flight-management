import { Controller } from '@nestjs/common';
import { PlaneService } from './plane.service';

@Controller('plane')
export class PlaneController {
  constructor(private readonly planeService: PlaneService) {}
}
