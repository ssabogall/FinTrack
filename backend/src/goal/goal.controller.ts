// external imports
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

// internal imports
import { CreateGoalDto } from './dtos/create-goal.dto';
import { UpdateGoalDto } from './dtos/update-goal.dto';
import { Goal } from './entities/goal.entity';
import { GoalService } from './goal.service';

@Controller('goals')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
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
  create(@Body() dto: CreateGoalDto): Promise<Goal> {
    return this.goalService.create(dto);
  }

  /**
   * Updates the savings goal identified by `id`. Ownership is verified
   * by comparing the persisted goal's userId with the one in the DTO.
   *
   * NOTE: `userId` will move to the JWT payload once the auth module is
   * integrated. See update-goal.dto.ts for the migration note.
   */
  @Patch(':id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateGoalDto,
  ): Promise<Goal> {
    return this.goalService.update(id, dto);
  }

  /**
   * Permanently deletes the savings goal identified by `id`.
   *
   * `userId` is supplied as a query parameter (rather than in the body)
   * because DELETE-with-body is not reliably supported by browser fetch
   * implementations. This is a temporary ownership check until the auth
   * module lands, at which point the parameter MUST be removed and the
   * caller's identity read from the JWT payload via @CurrentUser().
   *
   * Business rules (e.g. completed goals cannot be deleted) are enforced
   * by the service.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', new ParseIntPipe()) id: number,
    @Query('userId', new ParseIntPipe()) userId: number,
  ): Promise<void> {
    return this.goalService.delete(id, userId);
  }
}
