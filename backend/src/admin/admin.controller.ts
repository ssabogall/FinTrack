import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { AdminService } from './admin.service';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('overview')
  getOverview(@Req() _request: AuthenticatedRequest) {
    return this.adminService.getOverview();
  }

  @Get('monthly-trend')
  getMonthlyTrend(
    @Req() _request: AuthenticatedRequest,
    @Query('months') months?: string,
  ) {
    const parsedMonths = Number(months);
    return this.adminService.getMonthlyTrend(
      Number.isFinite(parsedMonths) && parsedMonths > 0 ? parsedMonths : 7,
    );
  }

  @Get('user-growth')
  getUserGrowth(
    @Req() _request: AuthenticatedRequest,
    @Query('months') months?: string,
  ) {
    const parsedMonths = Number(months);
    return this.adminService.getUserGrowthTrend(
      Number.isFinite(parsedMonths) && parsedMonths > 0 ? parsedMonths : 7,
    );
  }

  @Get('users-with-stats')
  getUsersWithStats(@Req() _request: AuthenticatedRequest) {
    return this.adminService.getUsersWithStats();
  }

  @Get('monthly-summary')
  getMonthlySummary(
    @Req() _request: AuthenticatedRequest,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.adminService.getMonthlySummary(Number(year), Number(month));
  }

  @Get('transactions')
  getTransactionsForMonth(
    @Req() _request: AuthenticatedRequest,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.adminService.getTransactionsForMonth(Number(year), Number(month));
  }

  @Get('category-breakdown')
  getCategoryBreakdown(
    @Req() _request: AuthenticatedRequest,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.adminService.getCategoryBreakdownForMonth(Number(year), Number(month));
  }
}
