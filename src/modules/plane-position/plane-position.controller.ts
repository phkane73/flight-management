import { Controller } from '@nestjs/common';
import { PlanePositionService } from './plane-position.service';

@Controller('plane-position')
export class PlanePositionController {
  constructor(private readonly planePositionService: PlanePositionService) {}
}
