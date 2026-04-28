import { Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { User } from '../user/entities/user.entity';
export interface TrendPoint {
    labels: string[];
    income: number[];
    expenses: number[];
}
export interface UserGrowthPoint {
    labels: string[];
    counts: number[];
}
export declare class AdminService {
    private userRepository;
    private transactionRepository;
    private categoryRepository;
    constructor(userRepository: Repository<User>, transactionRepository: Repository<Transaction>, categoryRepository: Repository<Category>);
    getOverview(): Promise<{
        totalIncome: number;
        totalExpenses: number;
        netSavings: number;
        totalUsers: number;
    }>;
    getMonthlyTrend(months?: number): Promise<TrendPoint>;
    getUserGrowthTrend(months?: number): Promise<UserGrowthPoint>;
    getUsersWithStats(): Promise<(Omit<User, 'password'> & {
        balance: number;
        transactionCount: number;
    })[]>;
    getTransactionsForMonth(year: number, month: number): Promise<Transaction[]>;
    getMonthlySummary(year: number, month: number): Promise<{
        income: number;
        expenses: number;
        netSavings: number;
        transactionCount: number;
    }>;
    getCategoryBreakdownForMonth(year: number, month: number): Promise<{
        category: Category;
        amount: number;
    }[]>;
    private validateYearMonth;
}
