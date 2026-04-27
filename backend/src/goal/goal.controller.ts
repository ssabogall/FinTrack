// external imports
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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
