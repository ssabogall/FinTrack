// external imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// internal imports
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { Category } from '../category/entities/category.entity';
import { Goal } from '../goal/entities/goal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Category, Goal])],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
