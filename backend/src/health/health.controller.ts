import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

/** Public health check controller — no authentication required. */
@Public()
@Controller('health')
export class HealthController {
  /** Returns the current server status and timestamp. */
  @Get()
  check(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
