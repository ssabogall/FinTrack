import type { AuthenticatedRequest } from '../auth/auth.guard';
import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getOverview(_request: AuthenticatedRequest): Promise<{
        totalIncome: number;
        totalExpenses: number;
        netSavings: number;
        totalUsers: number;
    }>;
    getMonthlyTrend(_request: AuthenticatedRequest, months?: string): Promise<import("./admin.service").TrendPoint>;
    getUserGrowth(_request: AuthenticatedRequest, months?: string): Promise<import("./admin.service").UserGrowthPoint>;
    getUsersWithStats(_request: AuthenticatedRequest): Promise<(Omit<import("../user/entities/user.entity").User, "password"> & {
        balance: number;
        transactionCount: number;
    })[]>;
    getMonthlySummary(_request: AuthenticatedRequest, year: string, month: string): Promise<{
        income: number;
        expenses: number;
        netSavings: number;
        transactionCount: number;
    }>;
    getTransactionsForMonth(_request: AuthenticatedRequest, year: string, month: string): Promise<import("../transaction/entities/transaction.entity").Transaction[]>;
    getCategoryBreakdown(_request: AuthenticatedRequest, year: string, month: string): Promise<{
        category: import("../category/entities/category.entity").Category;
        amount: number;
    }[]>;
}
