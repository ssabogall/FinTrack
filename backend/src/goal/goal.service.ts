// external imports
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// internal imports
import { CreateGoalDto } from './dtos/create-goal.dto';
import { Goal } from './entities/goal.entity';
import { User } from '../user/entities/user.entity';

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
}
