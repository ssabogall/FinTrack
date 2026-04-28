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
import { Goal, type GoalStatus } from './entities/goal.entity';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  async findAllByUser(userId: number): Promise<Goal[]> {
    return this.goalRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateGoalDto): Promise<Goal> {
    if (dto.targetAmount <= 0) throw new BadRequestException('Target amount must be greater than 0');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) throw new BadRequestException('End date must be after start date');

    const goal = this.goalRepository.create({
      ...dto,
      description: dto.description ?? '',
      currentAmount: 0,
      startDate,
      endDate,
      status: GoalService.computeStatus(0, dto.targetAmount),
    });
    return this.goalRepository.save(goal);
  }

  async update(id: number, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.goalRepository.findOneBy({ id });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== dto.userId) throw new ForbiddenException('You do not own this goal');

    const { startDate, endDate, ...rest } = dto;
    const updates: Partial<Goal> = { ...rest };
    if (startDate) updates.startDate = new Date(startDate);
    if (endDate) updates.endDate = new Date(endDate);

    const merged: Goal = { ...goal, ...updates };
    if (merged.targetAmount <= 0) throw new BadRequestException('Target amount must be greater than 0');
    if (merged.endDate <= merged.startDate) throw new BadRequestException('End date must be after start date');
    merged.status = GoalService.computeStatus(Number(merged.currentAmount), Number(merged.targetAmount));

    return this.goalRepository.save(merged);
  }

  async delete(id: number, userId: number): Promise<void> {
    const goal = await this.goalRepository.findOneBy({ id });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException('You do not own this goal');
    if (goal.status === 'Completed') throw new ConflictException('Completed goals cannot be deleted');

    await this.goalRepository.remove(goal);
  }

  private static computeStatus(currentAmount: number, targetAmount: number): GoalStatus {
    if (currentAmount <= 0) return 'Active';
    if (currentAmount >= targetAmount) return 'Completed';
    return 'In Progress';
  }
}
