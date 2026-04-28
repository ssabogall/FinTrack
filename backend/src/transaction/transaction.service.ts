import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// internal imports
import { Category } from '../category/entities/category.entity';
import { Goal, type GoalStatus } from '../goal/entities/goal.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
  ) {}

  async findAllByUser(userId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(userId: number, dto: CreateTransactionDto): Promise<Transaction> {
    if (!dto.description.trim())
      throw new BadRequestException('Description cannot be empty');
    if (dto.amount === 0)
      throw new BadRequestException('Amount cannot be zero');

    const date = new Date(dto.date);
    if (Number.isNaN(date.getTime()))
      throw new BadRequestException('Invalid transaction date');

    const categoryId = await this.validateCategoryOwnership(userId, dto.categoryId);
    const goal = await this.validateGoalOwnership(userId, dto.goalId);

    const transaction = this.transactionRepository.create({
      amount: dto.amount,
      description: dto.description.trim(),
      date,
      userId,
      categoryId,
      goalId: goal?.id ?? null,
    });

    const saved = await this.transactionRepository.save(transaction);
    if (goal) await this.applyGoalDelta(goal, Math.abs(saved.amount));

    return saved;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOwnedTransaction(userId, id);

    if (dto.description !== undefined && !dto.description.trim())
      throw new BadRequestException('Description cannot be empty');
    if (dto.amount !== undefined && dto.amount === 0)
      throw new BadRequestException('Amount cannot be zero');

    const previousGoalId = transaction.goalId;
    const previousAmountAbs = Math.abs(transaction.amount);

    if (dto.categoryId !== undefined) {
      transaction.categoryId = await this.validateCategoryOwnership(
        userId,
        dto.categoryId,
      );
    }

    if (dto.goalId !== undefined) {
      const nextGoal = await this.validateGoalOwnership(userId, dto.goalId);
      transaction.goalId = nextGoal?.id ?? null;
    }

    if (dto.amount !== undefined) transaction.amount = dto.amount;
    if (dto.description !== undefined) transaction.description = dto.description.trim();
    if (dto.date !== undefined) {
      const date = new Date(dto.date);
      if (Number.isNaN(date.getTime()))
        throw new BadRequestException('Invalid transaction date');
      transaction.date = date;
    }

    const updated = await this.transactionRepository.save(transaction);
    const nextGoalId = updated.goalId;
    const nextAmountAbs = Math.abs(updated.amount);

    if (previousGoalId && previousGoalId !== nextGoalId) {
      const previousGoal = await this.goalRepository.findOneBy({ id: previousGoalId });
      if (previousGoal) await this.applyGoalDelta(previousGoal, -previousAmountAbs);
    }

    if (nextGoalId && previousGoalId !== nextGoalId) {
      const nextGoal = await this.goalRepository.findOneBy({ id: nextGoalId });
      if (nextGoal) await this.applyGoalDelta(nextGoal, nextAmountAbs);
    } else if (nextGoalId && previousGoalId === nextGoalId && previousAmountAbs !== nextAmountAbs) {
      const sameGoal = await this.goalRepository.findOneBy({ id: nextGoalId });
      if (sameGoal) await this.applyGoalDelta(sameGoal, nextAmountAbs - previousAmountAbs);
    }

    return updated;
  }

  async delete(userId: number, id: number): Promise<void> {
    const transaction = await this.findOwnedTransaction(userId, id);
    const amountAbs = Math.abs(transaction.amount);
    const goalId = transaction.goalId;

    await this.transactionRepository.delete(id);

    if (goalId) {
      const goal = await this.goalRepository.findOneBy({ id: goalId });
      if (goal) await this.applyGoalDelta(goal, -amountAbs);
    }
  }

  private async findOwnedTransaction(
    userId: number,
    id: number,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneBy({ id });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.userId !== userId)
      throw new ForbiddenException('You do not own this transaction');
    return transaction;
  }

  private async validateCategoryOwnership(
    userId: number,
    categoryId?: number | null,
  ): Promise<number | null> {
    if (categoryId === undefined || categoryId === null) return null;

    const category = await this.categoryRepository.findOneBy({ id: categoryId });
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId)
      throw new ForbiddenException('You do not own this category');
    return category.id;
  }

  private async validateGoalOwnership(
    userId: number,
    goalId?: number | null,
  ): Promise<Goal | null> {
    if (goalId === undefined || goalId === null) return null;

    const goal = await this.goalRepository.findOneBy({ id: goalId });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId)
      throw new ForbiddenException('You do not own this goal');
    return goal;
  }

  private async applyGoalDelta(goal: Goal, delta: number): Promise<void> {
    const nextCurrentAmount = Math.max(goal.currentAmount + delta, 0);
    goal.currentAmount = nextCurrentAmount;
    goal.status = this.computeGoalStatus(goal.currentAmount, goal.targetAmount);
    await this.goalRepository.save(goal);
  }

  private computeGoalStatus(
    currentAmount: number,
    targetAmount: number,
  ): GoalStatus {
    if (currentAmount <= 0) return 'Active';
    if (currentAmount >= targetAmount) return 'Completed';
    return 'In Progress';
  }
}
