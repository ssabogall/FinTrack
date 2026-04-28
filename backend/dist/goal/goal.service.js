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
var GoalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const goal_entity_1 = require("./entities/goal.entity");
let GoalService = GoalService_1 = class GoalService {
    goalRepository;
    constructor(goalRepository) {
        this.goalRepository = goalRepository;
    }
    async findAllByUser(userId) {
        return this.goalRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOneByUser(id, userId) {
        const goal = await this.goalRepository.findOneBy({ id });
        if (!goal)
            throw new common_1.NotFoundException('Goal not found');
        if (goal.userId !== userId)
            throw new common_1.ForbiddenException('You do not own this goal');
        return goal;
    }
    async create(userId, dto) {
        if (dto.targetAmount <= 0)
            throw new common_1.BadRequestException('Target amount must be greater than 0');
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (endDate <= startDate)
            throw new common_1.BadRequestException('End date must be after start date');
        const goal = this.goalRepository.create({
            ...dto,
            description: dto.description ?? '',
            currentAmount: 0,
            startDate,
            endDate,
            status: GoalService_1.computeStatus(0, dto.targetAmount),
            userId,
        });
        return this.goalRepository.save(goal);
    }
    async update(id, userId, dto) {
        const goal = await this.findOneByUser(id, userId);
        const { startDate, endDate, ...rest } = dto;
        const updates = { ...rest };
        if (startDate)
            updates.startDate = new Date(startDate);
        if (endDate)
            updates.endDate = new Date(endDate);
        const merged = { ...goal, ...updates };
        if (merged.targetAmount <= 0)
            throw new common_1.BadRequestException('Target amount must be greater than 0');
        if (merged.endDate <= merged.startDate)
            throw new common_1.BadRequestException('End date must be after start date');
        merged.status = GoalService_1.computeStatus(merged.currentAmount, merged.targetAmount);
        return this.goalRepository.save(merged);
    }
    async delete(id, userId) {
        const goal = await this.findOneByUser(id, userId);
        if (goal.status === 'Completed')
            throw new common_1.ConflictException('Completed goals cannot be deleted');
        await this.goalRepository.remove(goal);
    }
    static computeStatus(currentAmount, targetAmount) {
        if (currentAmount <= 0)
            return 'Active';
        if (currentAmount >= targetAmount)
            return 'Completed';
        return 'In Progress';
    }
};
exports.GoalService = GoalService;
exports.GoalService = GoalService = GoalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(goal_entity_1.Goal)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GoalService);
//# sourceMappingURL=goal.service.js.map