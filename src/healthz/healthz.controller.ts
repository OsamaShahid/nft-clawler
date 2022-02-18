import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('healthz')
@Controller({
  path: 'healthz',
  version: '1',
})
export class HealthzController {
  @Get('liveness')
  liveness(@Res() res: Response) {
    return res.status(HttpStatus.OK).send();
  }

  @Get('readiness')
  readiness(@Res() res: Response) {
    return res.status(HttpStatus.OK).send();
  }
}
