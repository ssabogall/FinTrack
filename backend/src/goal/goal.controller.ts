import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

// internal imports
import { CreateGoalDto } from './dtos/create-goal.dto';
import { UpdateGoalDto } from './dtos/update-goal.dto';
import { Goal } from './entities/goal.entity';
import { GoalService } from './goal.service';

@Controller('goals')
export class GoalController {
  constructor(private goalService: GoalService) {}

  @Get()
  findAll(@Query('userId', ParseIntPipe) userId: number): Promise<Goal[]> {
    return this.goalService.findAllByUser(userId);
  }

  @Post()
  create(@Body() dto: CreateGoalDto): Promise<Goal> {
    return this.goalService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGoalDto,
  ): Promise<Goal> {
    return this.goalService.update(id, dto);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return this.goalService.delete(id, userId);
  }
}
