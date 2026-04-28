// external imports
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';

// internal imports
// internal imports
import { Transaction } from './entities/transaction.entity';
import { Category } from '../category/entities/category.entity';
import { Goal } from '../goal/entities/goal.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';

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

  public async findAllByUser(userId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({ where: { userId }, order: { date: 'DESC' } });
  }

  public async findById(id: number): Promise<Transaction | null> {
    return this.transactionRepository.findOne({ where: { id } });
  }

  public async create(userId: number, dto: CreateTransactionDto): Promise<Transaction> {
    if (dto.amount === 0) {
      throw new BadRequestException('Amount cannot be zero');
    }

    // Validate category belongs to user when provided
    let category: Category | null = null;
    if (dto.categoryId !== undefined && dto.categoryId !== null) {
      category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      if (category.userId !== userId) {
        throw new UnauthorizedException('Category does not belong to the authenticated user');
      }
    }

    // Validate goal when provided
    let goal: Goal | null = null;
    if (dto.goalId !== undefined && dto.goalId !== null) {
      goal = await this.goalRepository.findOne({ where: { id: dto.goalId } });
      if (!goal) {
        throw new NotFoundException('Goal not found');
      }
      if (goal.userId !== userId) {
        throw new UnauthorizedException('Goal does not belong to the authenticated user');
      }
    }

    return this.transactionRepository.save(
      this.transactionRepository.create({
        amount: dto.amount,
        description: dto.description,
        date: dto.date,
        userId,
        categoryId: dto.categoryId ?? null,
        goalId: dto.goalId ?? null,
      }),
    );
  }

  public async update(userId: number, id: number, dto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (transaction.userId !== userId) {
      throw new UnauthorizedException('Cannot modify another user\'s transaction');
    }

    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        transaction.categoryId = null;
      } else {
        const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
        if (!category) throw new NotFoundException('Category not found');
        if (category.userId !== userId) throw new UnauthorizedException('Category does not belong to user');
        transaction.categoryId = dto.categoryId;
      }
    }

    if (dto.goalId !== undefined) {
      if (dto.goalId === null) {
        transaction.goalId = null;
      } else {
        const goal = await this.goalRepository.findOne({ where: { id: dto.goalId } });
        if (!goal) throw new NotFoundException('Goal not found');
        if (goal.userId !== userId) throw new UnauthorizedException('Goal does not belong to user');
        transaction.goalId = dto.goalId;
      }
    }

    if (dto.amount !== undefined) transaction.amount = dto.amount;
    if (dto.description !== undefined) transaction.description = dto.description;
    if (dto.date !== undefined) transaction.date = dto.date;

    return this.transactionRepository.save(transaction);
  }

  public async delete(userId: number, id: number): Promise<void> {
    const transaction = await this.transactionRepository.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.userId !== userId) throw new UnauthorizedException('Cannot delete another user\'s transaction');

    await this.transactionRepository.delete(id);
  }
}
