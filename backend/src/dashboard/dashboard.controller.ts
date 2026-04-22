import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

/** REST controller exposing dashboard aggregation endpoints. */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** Returns aggregated order statistics: totals, stock counts, and monthly breakdown. */
  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
