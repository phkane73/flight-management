import { Controller } from '@nestjs/common';
import { RunwayService } from './runway.service';

@Controller('runway')
export class RunwayController {
  constructor(private readonly runwayService: RunwayService) {}
}
