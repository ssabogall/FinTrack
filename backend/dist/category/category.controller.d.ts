import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
export declare class CategoryController {
    private categoryService;
    constructor(categoryService: CategoryService);
    findAll(request: AuthenticatedRequest): Promise<Category[]>;
    findOne(id: number, request: AuthenticatedRequest): Promise<Category>;
    create(dto: CreateCategoryDto, request: AuthenticatedRequest): Promise<Category>;
    update(id: number, dto: UpdateCategoryDto, request: AuthenticatedRequest): Promise<Category>;
    delete(id: number, request: AuthenticatedRequest): Promise<void>;
}
