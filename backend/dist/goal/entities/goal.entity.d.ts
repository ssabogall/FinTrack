import { Transaction } from '../../transaction/entities/transaction.entity';
import { User } from '../../user/entities/user.entity';
export type GoalStatus = 'Active' | 'In Progress' | 'Completed';
export declare class Goal {
    id: number;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    startDate: Date;
    endDate: Date;
    status: GoalStatus;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    user: User;
    transactions: Transaction[];
}
