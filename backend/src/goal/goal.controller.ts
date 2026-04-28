import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CreateGoalDto } from './dtos/create-goal.dto';
import { UpdateGoalDto } from './dtos/update-goal.dto';
import { Goal } from './entities/goal.entity';
import { GoalService } from './goal.service';

@UseGuards(AuthGuard)
@Controller('goals')
export class GoalController {
  constructor(private goalService: GoalService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest): Promise<Goal[]> {
    return this.goalService.findAllByUser(request.user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<Goal> {
    return this.goalService.findOneByUser(id, request.user.sub);
  }

  @Post()
  create(
    @Body() dto: CreateGoalDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Goal> {
    return this.goalService.create(request.user.sub, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGoalDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Goal> {
    return this.goalService.update(id, request.user.sub, dto);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.goalService.delete(id, request.user.sub);
  }
}
