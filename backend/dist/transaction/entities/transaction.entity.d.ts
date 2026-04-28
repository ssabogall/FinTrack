import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { Goal } from '../../goal/entities/goal.entity';
export declare class Transaction {
    id: number;
    amount: number;
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    user: User;
    categoryId: number | null;
    category: Category | null;
    goalId: number | null;
    goal: Goal | null;
}
