import { Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity';
import { Goal } from '../goal/entities/goal.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
export declare class TransactionService {
    private transactionRepository;
    private categoryRepository;
    private goalRepository;
    constructor(transactionRepository: Repository<Transaction>, categoryRepository: Repository<Category>, goalRepository: Repository<Goal>);
    findAllByUser(userId: number): Promise<Transaction[]>;
    findOneByUser(userId: number, id: number): Promise<Transaction>;
    create(userId: number, dto: CreateTransactionDto): Promise<Transaction>;
    update(userId: number, id: number, dto: UpdateTransactionDto): Promise<Transaction>;
    delete(userId: number, id: number): Promise<void>;
    private findOwnedTransaction;
    private validateCategoryOwnership;
    private validateGoalOwnership;
    private applyGoalDelta;
    private computeGoalStatus;
}
