import { Repository } from 'typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './entities/category.entity';
export declare class CategoryService {
    private categoryRepository;
    private transactionRepository;
    constructor(categoryRepository: Repository<Category>, transactionRepository: Repository<Transaction>);
    findAllByUser(userId: number): Promise<Category[]>;
    findOneByUser(id: number, userId: number): Promise<Category>;
    create(userId: number, dto: CreateCategoryDto): Promise<Category>;
    update(id: number, userId: number, dto: UpdateCategoryDto): Promise<Category>;
    delete(id: number, userId: number): Promise<void>;
}
