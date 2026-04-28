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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../category/entities/category.entity");
const goal_entity_1 = require("../goal/entities/goal.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
let TransactionService = class TransactionService {
    transactionRepository;
    categoryRepository;
    goalRepository;
    constructor(transactionRepository, categoryRepository, goalRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.goalRepository = goalRepository;
    }
    async findAllByUser(userId) {
        return this.transactionRepository.find({
            where: { userId },
            order: { date: 'DESC', createdAt: 'DESC' },
        });
    }
    async findOneByUser(userId, id) {
        return this.findOwnedTransaction(userId, id);
    }
    async create(userId, dto) {
        if (!dto.description.trim())
            throw new common_1.BadRequestException('Description cannot be empty');
        if (dto.amount === 0)
            throw new common_1.BadRequestException('Amount cannot be zero');
        const date = new Date(dto.date);
        if (Number.isNaN(date.getTime()))
            throw new common_1.BadRequestException('Invalid transaction date');
        const categoryId = await this.validateCategoryOwnership(userId, dto.categoryId);
        const goal = await this.validateGoalOwnership(userId, dto.goalId);
        const transaction = this.transactionRepository.create({
            amount: dto.amount,
            description: dto.description.trim(),
            date,
            userId,
            categoryId,
            goalId: goal?.id ?? null,
        });
        const saved = await this.transactionRepository.save(transaction);
        if (goal)
            await this.applyGoalDelta(goal, Math.abs(saved.amount));
        return saved;
    }
    async update(userId, id, dto) {
        const transaction = await this.findOwnedTransaction(userId, id);
        if (dto.description !== undefined && !dto.description.trim())
            throw new common_1.BadRequestException('Description cannot be empty');
        if (dto.amount !== undefined && dto.amount === 0)
            throw new common_1.BadRequestException('Amount cannot be zero');
        const previousGoalId = transaction.goalId;
        const previousAmountAbs = Math.abs(transaction.amount);
        if (dto.categoryId !== undefined) {
            transaction.categoryId = await this.validateCategoryOwnership(userId, dto.categoryId);
        }
        if (dto.goalId !== undefined) {
            const nextGoal = await this.validateGoalOwnership(userId, dto.goalId);
            transaction.goalId = nextGoal?.id ?? null;
        }
        if (dto.amount !== undefined)
            transaction.amount = dto.amount;
        if (dto.description !== undefined)
            transaction.description = dto.description.trim();
        if (dto.date !== undefined) {
            const date = new Date(dto.date);
            if (Number.isNaN(date.getTime()))
                throw new common_1.BadRequestException('Invalid transaction date');
            transaction.date = date;
        }
        const updated = await this.transactionRepository.save(transaction);
        const nextGoalId = updated.goalId;
        const nextAmountAbs = Math.abs(updated.amount);
        if (previousGoalId && previousGoalId !== nextGoalId) {
            const previousGoal = await this.goalRepository.findOneBy({
                id: previousGoalId,
            });
            if (previousGoal)
                await this.applyGoalDelta(previousGoal, -previousAmountAbs);
        }
        if (nextGoalId && previousGoalId !== nextGoalId) {
            const nextGoal = await this.goalRepository.findOneBy({ id: nextGoalId });
            if (nextGoal)
                await this.applyGoalDelta(nextGoal, nextAmountAbs);
        }
        else if (nextGoalId &&
            previousGoalId === nextGoalId &&
            previousAmountAbs !== nextAmountAbs) {
            const sameGoal = await this.goalRepository.findOneBy({ id: nextGoalId });
            if (sameGoal)
                await this.applyGoalDelta(sameGoal, nextAmountAbs - previousAmountAbs);
        }
        return updated;
    }
    async delete(userId, id) {
        const transaction = await this.findOwnedTransaction(userId, id);
        const amountAbs = Math.abs(transaction.amount);
        const goalId = transaction.goalId;
        await this.transactionRepository.delete(id);
        if (goalId) {
            const goal = await this.goalRepository.findOneBy({ id: goalId });
            if (goal)
                await this.applyGoalDelta(goal, -amountAbs);
        }
    }
    async findOwnedTransaction(userId, id) {
        const transaction = await this.transactionRepository.findOneBy({ id });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        if (transaction.userId !== userId)
            throw new common_1.ForbiddenException('You do not own this transaction');
        return transaction;
    }
    async validateCategoryOwnership(userId, categoryId) {
        if (categoryId === undefined || categoryId === null)
            return null;
        const category = await this.categoryRepository.findOneBy({
            id: categoryId,
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        if (category.userId !== userId)
            throw new common_1.ForbiddenException('You do not own this category');
        return category.id;
    }
    async validateGoalOwnership(userId, goalId) {
        if (goalId === undefined || goalId === null)
            return null;
        const goal = await this.goalRepository.findOneBy({ id: goalId });
        if (!goal)
            throw new common_1.NotFoundException('Goal not found');
        if (goal.userId !== userId)
            throw new common_1.ForbiddenException('You do not own this goal');
        return goal;
    }
    async applyGoalDelta(goal, delta) {
        const nextCurrentAmount = Math.max(goal.currentAmount + delta, 0);
        goal.currentAmount = nextCurrentAmount;
        goal.status = this.computeGoalStatus(goal.currentAmount, goal.targetAmount);
        await this.goalRepository.save(goal);
    }
    computeGoalStatus(currentAmount, targetAmount) {
        if (currentAmount <= 0)
            return 'Active';
        if (currentAmount >= targetAmount)
            return 'Completed';
        return 'In Progress';
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(goal_entity_1.Goal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map