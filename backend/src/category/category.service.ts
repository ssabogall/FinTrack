// external imports
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// internal imports
import { Transaction } from '../transaction/entities/transaction.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findAllByUser(userId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneByUser(id: number, userId: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId)
      throw new ForbiddenException('You do not own this category');
    return category;
  }

  async create(userId: number, dto: CreateCategoryDto): Promise<Category> {
    const normalizedName = dto.name.trim();
    if (!normalizedName)
      throw new BadRequestException('Category name cannot be empty');

    const normalizedType = dto.type.trim().toLowerCase();
    if (normalizedType !== 'income' && normalizedType !== 'expense')
      throw new BadRequestException('Category type must be income or expense');

    const duplicate = await this.categoryRepository.findOneBy({
      userId,
      name: normalizedName,
    });
    if (duplicate)
      throw new ConflictException('A category with this name already exists');

    const category = this.categoryRepository.create({
      name: normalizedName,
      color: dto.color.trim(),
      type: normalizedType,
      userId,
    });
    return this.categoryRepository.save(category);
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOneByUser(id, userId);

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();
      if (!normalizedName)
        throw new BadRequestException('Category name cannot be empty');

      const duplicate = await this.categoryRepository.findOneBy({
        userId,
        name: normalizedName,
      });
      if (duplicate && duplicate.id !== id)
        throw new ConflictException('A category with this name already exists');
      category.name = normalizedName;
    }

    if (dto.color !== undefined) {
      category.color = dto.color.trim();
    }

    if (dto.type !== undefined) {
      const normalizedType = dto.type.trim().toLowerCase();
      if (normalizedType !== 'income' && normalizedType !== 'expense')
        throw new BadRequestException(
          'Category type must be income or expense',
        );
      category.type = normalizedType;
    }

    return this.categoryRepository.save(category);
  }

  async delete(id: number, userId: number): Promise<void> {
    const category = await this.findOneByUser(id, userId);
    const transactions = await this.transactionRepository.countBy({
      categoryId: id,
    });
    if (transactions > 0)
      throw new ConflictException(
        'Cannot delete a category that has associated transactions',
      );
    await this.categoryRepository.remove(category);
  }
}
