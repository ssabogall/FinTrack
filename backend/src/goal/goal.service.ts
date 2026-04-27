// external imports
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// internal imports
import { CreateGoalDto } from './dtos/create-goal.dto';
import { UpdateGoalDto } from './dtos/update-goal.dto';
import { Goal } from './entities/goal.entity';
import { User } from '../user/entities/user.entity';

type GoalStatus = 'Active' | 'In Progress' | 'Completed';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateGoalDto): Promise<Goal> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date.');
    }

    const userExists = await this.userRepository.existsBy({ id: dto.userId });
    if (!userExists) {
      throw new BadRequestException(`User with id ${dto.userId} does not exist.`);
    }

    const goal = this.goalRepository.create({
      name: dto.name,
      description: dto.description ?? '',
      targetAmount: dto.targetAmount,
      currentAmount: 0,
      startDate,
      endDate,
      status: 'In Progress',
      userId: dto.userId,
    });

    return this.goalRepository.save(goal);
  }

  /**
   * Returns every savings goal owned by the given user, ordered with the
   * most recently created first.
   *
   * Returns an empty array if the user has no goals or does not exist.
   * Distinguishing both cases is intentionally avoided here: it keeps the
   * client logic simple and does not leak user existence to unauthenticated
   * callers (relevant once auth lands).
   */
  findAllByUser(userId: number): Promise<Goal[]> {
    return this.goalRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Updates an existing savings goal. Only the fields provided in the DTO
   * are modified. `currentAmount` is preserved; `status` is recomputed
   * from the (possibly new) targetAmount.
   *
   * Ownership is verified by comparing the persisted goal's userId with
   * the one supplied in the DTO. This is a temporary measure until auth
   * lands, at which point the userId will come from the JWT payload.
   */
  async update(id: number, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.goalRepository.findOneBy({ id });
    if (!goal) {
      throw new NotFoundException(`Goal with id ${id} does not exist.`);
    }

    if (goal.userId !== dto.userId) {
      throw new ForbiddenException('You do not own this goal.');
    }

    const finalStartDate = dto.startDate !== undefined ? new Date(dto.startDate) : goal.startDate;
    const finalEndDate = dto.endDate !== undefined ? new Date(dto.endDate) : goal.endDate;

    if (
      Number.isNaN(finalStartDate.getTime()) ||
      Number.isNaN(finalEndDate.getTime())
    ) {
      throw new BadRequestException('Invalid date format.');
    }

    if (finalEndDate <= finalStartDate) {
      throw new BadRequestException('End date must be after start date.');
    }

    if (dto.name !== undefined) {
      goal.name = dto.name;
    }
    if (dto.description !== undefined) {
      goal.description = dto.description;
    }
    if (dto.targetAmount !== undefined) {
      goal.targetAmount = dto.targetAmount;
    }
    if (dto.startDate !== undefined) {
      goal.startDate = finalStartDate;
    }
    if (dto.endDate !== undefined) {
      goal.endDate = finalEndDate;
    }

    goal.status = GoalService.computeStatus(
      Number(goal.currentAmount),
      Number(goal.targetAmount),
    );

    return this.goalRepository.save(goal);
  }

  /**
   * Pure status calculation, mirrors the frontend's GoalUtils.computeStatus
   * so both sides agree on the rule.
   */
  private static computeStatus(currentAmount: number, targetAmount: number): GoalStatus {
    if (currentAmount <= 0) return 'Active';
    if (currentAmount >= targetAmount) return 'Completed';
    return 'In Progress';
  }

  /**
   * Permanently deletes a savings goal.
   *
   * Business rules enforced here (the frontend disables the button as UX
   * but the rule lives in the backend, which is the source of truth):
   *   - The caller must own the goal (temporary userId check until auth).
   *   - Completed goals are preserved as part of the user's financial
   *     history and cannot be deleted.
   */
  async delete(id: number, userId: number): Promise<void> {
    const goal = await this.goalRepository.findOneBy({ id });
    if (!goal) {
      throw new NotFoundException(`Goal with id ${id} does not exist.`);
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException('You do not own this goal.');
    }

    if (goal.status === 'Completed') {
      throw new ConflictException('Completed goals cannot be deleted.');
    }

    await this.goalRepository.remove(goal);
  }
}
