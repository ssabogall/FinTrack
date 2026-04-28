import type { AuthenticatedRequest } from '../auth/auth.guard';
import type { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { TransactionService } from './transaction.service';
export declare class TransactionController {
    private transactionService;
    constructor(transactionService: TransactionService);
    create(dto: CreateTransactionDto, request: AuthenticatedRequest): Promise<Transaction>;
    findAll(request: AuthenticatedRequest): Promise<Transaction[]>;
    findOne(id: number, request: AuthenticatedRequest): Promise<Transaction>;
    update(id: number, dto: UpdateTransactionDto, request: AuthenticatedRequest): Promise<Transaction>;
    delete(id: number, request: AuthenticatedRequest): Promise<void>;
}
