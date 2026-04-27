// external imports
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

// internal imports
import { CreateGoalDto } from './dtos/create-goal.dto';
import { Goal } from './entities/goal.entity';
import { GoalService } from './goal.service';

@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  /**
   * Lists every savings goal owned by the user identified by the `userId`
   * query parameter.
   *
   * NOTE: `userId` will move to the JWT payload once the auth module is
   * integrated. Until then, the parameter is required and validated as a
   * positive integer.
   */
  @Get()
  findAll(@Query('userId', new ParseIntPipe()) userId: number): Promise<Goal[]> {
    return this.goalService.findAllByUser(userId);
  }

  /**
   * Creates a new savings goal for the user identified by `userId` in the body.
   *
   * NOTE: `userId` will move to the JWT payload once the auth module is
   * integrated. See create-goal.dto.ts for the migration note.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  create(@Body() dto: CreateGoalDto): Promise<Goal> {
    return this.goalService.create(dto);
  }
}
