"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../category/entities/category.entity");
const transaction_entity_1 = require("../transaction/entities/transaction.entity");
const user_entity_1 = require("../user/entities/user.entity");
let AdminService = class AdminService {
    userRepository;
    transactionRepository;
    categoryRepository;
    constructor(userRepository, transactionRepository, categoryRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }
    async getOverview() {
        const users = await this.userRepository.find();
        const transactions = await this.transactionRepository.find();
        const totalIncome = transactions
            .filter((t) => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter((t) => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return {
            totalIncome,
            totalExpenses,
            netSavings: totalIncome - totalExpenses,
            totalUsers: users.filter((u) => u.role === 'user').length,
        };
    }
    async getMonthlyTrend(months = 7) {
        const transactions = await this.transactionRepository.find();
        const today = new Date();
        const labels = [];
        const income = [];
        const expenses = [];
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = d.toLocaleDateString('en-US', {
                month: 'short',
                year: '2-digit',
            });
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
            labels.push(label);
            income.push(transactions
                .filter((t) => {
                const ts = new Date(t.date).getTime();
                return t.amount > 0 && ts >= monthStart && ts <= monthEnd;
            })
                .reduce((sum, t) => sum + t.amount, 0));
            expenses.push(transactions
                .filter((t) => {
                const ts = new Date(t.date).getTime();
                return t.amount < 0 && ts >= monthStart && ts <= monthEnd;
            })
                .reduce((sum, t) => sum + Math.abs(t.amount), 0));
        }
        return { labels, income, expenses };
    }
    async getUserGrowthTrend(months = 7) {
        const users = (await this.userRepository.find()).filter((u) => u.role === 'user');
        const today = new Date();
        const labels = [];
        const counts = [];
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = d.toLocaleDateString('en-US', {
                month: 'short',
                year: '2-digit',
            });
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
            const count = users.filter((u) => new Date(u.createdAt).getTime() <= monthEnd).length;
            labels.push(label);
            counts.push(count);
        }
        return { labels, counts };
    }
    async getUsersWithStats() {
        const users = await this.userRepository.find();
        const transactions = await this.transactionRepository.find();
        return users
            .filter((u) => u.role === 'user')
            .map((user) => {
            const userTransactions = transactions.filter((t) => t.userId === user.id);
            const balance = userTransactions.reduce((sum, t) => sum + t.amount, 0);
            const { password: _password, ...safeUser } = user;
            return {
                ...safeUser,
                balance,
                transactionCount: userTransactions.length,
            };
        })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getTransactionsForMonth(year, month) {
        this.validateYearMonth(year, month);
        const transactions = await this.transactionRepository.find();
        const monthStart = new Date(year, month - 1, 1).getTime();
        const monthEnd = new Date(year, month, 0, 23, 59, 59).getTime();
        return transactions
            .filter((t) => {
            const ts = new Date(t.date).getTime();
            return ts >= monthStart && ts <= monthEnd;
        })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    async getMonthlySummary(year, month) {
        const transactions = await this.getTransactionsForMonth(year, month);
        const income = transactions
            .filter((t) => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
            .filter((t) => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return {
            income,
            expenses,
            netSavings: income - expenses,
            transactionCount: transactions.length,
        };
    }
    async getCategoryBreakdownForMonth(year, month) {
        const transactions = await this.getTransactionsForMonth(year, month);
        const categories = await this.categoryRepository.find();
        const expenseByCategory = new Map();
        for (const t of transactions) {
            if (t.amount < 0 && t.categoryId != null) {
                const current = expenseByCategory.get(t.categoryId) ?? 0;
                expenseByCategory.set(t.categoryId, current + Math.abs(t.amount));
            }
        }
        return Array.from(expenseByCategory.entries())
            .map(([categoryId, amount]) => {
            const category = categories.find((c) => c.id === categoryId);
            return category ? { category, amount } : null;
        })
            .filter((x) => x != null)
            .sort((a, b) => b.amount - a.amount);
    }
    validateYearMonth(year, month) {
        if (!Number.isInteger(year) || year < 1970 || year > 3000) {
            throw new common_1.BadRequestException('Invalid year');
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new common_1.BadRequestException('Invalid month');
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map