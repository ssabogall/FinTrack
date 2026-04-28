import { Category } from '../../category/entities/category.entity';
import { Goal } from '../../goal/entities/goal.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
    categories: Category[];
    goals: Goal[];
    transactions: Transaction[];
}
