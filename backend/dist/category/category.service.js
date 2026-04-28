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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../transaction/entities/transaction.entity");
const category_entity_1 = require("./entities/category.entity");
let CategoryService = class CategoryService {
    categoryRepository;
    transactionRepository;
    constructor(categoryRepository, transactionRepository) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }
    async findAllByUser(userId) {
        return this.categoryRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOneByUser(id, userId) {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        if (category.userId !== userId)
            throw new common_1.ForbiddenException('You do not own this category');
        return category;
    }
    async create(userId, dto) {
        const normalizedName = dto.name.trim();
        if (!normalizedName)
            throw new common_1.BadRequestException('Category name cannot be empty');
        const normalizedType = dto.type.trim().toLowerCase();
        if (normalizedType !== 'income' && normalizedType !== 'expense')
            throw new common_1.BadRequestException('Category type must be income or expense');
        const duplicate = await this.categoryRepository.findOneBy({
            userId,
            name: normalizedName,
        });
        if (duplicate)
            throw new common_1.ConflictException('A category with this name already exists');
        const category = this.categoryRepository.create({
            name: normalizedName,
            color: dto.color.trim(),
            type: normalizedType,
            userId,
        });
        return this.categoryRepository.save(category);
    }
    async update(id, userId, dto) {
        const category = await this.findOneByUser(id, userId);
        if (dto.name !== undefined) {
            const normalizedName = dto.name.trim();
            if (!normalizedName)
                throw new common_1.BadRequestException('Category name cannot be empty');
            const duplicate = await this.categoryRepository.findOneBy({
                userId,
                name: normalizedName,
            });
            if (duplicate && duplicate.id !== id)
                throw new common_1.ConflictException('A category with this name already exists');
            category.name = normalizedName;
        }
        if (dto.color !== undefined) {
            category.color = dto.color.trim();
        }
        if (dto.type !== undefined) {
            const normalizedType = dto.type.trim().toLowerCase();
            if (normalizedType !== 'income' && normalizedType !== 'expense')
                throw new common_1.BadRequestException('Category type must be income or expense');
            category.type = normalizedType;
        }
        return this.categoryRepository.save(category);
    }
    async delete(id, userId) {
        const category = await this.findOneByUser(id, userId);
        const transactions = await this.transactionRepository.countBy({
            categoryId: id,
        });
        if (transactions > 0)
            throw new common_1.ConflictException('Cannot delete a category that has associated transactions');
        await this.categoryRepository.remove(category);
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CategoryService);
//# sourceMappingURL=category.service.js.map