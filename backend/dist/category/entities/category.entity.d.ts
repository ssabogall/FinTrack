import { User } from '../../user/entities/user.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
export declare class Category {
    id: number;
    name: string;
    color: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    user: User;
    transactions: Transaction[];
}
