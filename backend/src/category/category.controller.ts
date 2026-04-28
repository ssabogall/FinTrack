import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest): Promise<Category[]> {
    return this.categoryService.findAllByUser(request.user.sub);
  }

  @Post()
  create(
    @Body() dto: CreateCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Category> {
    return this.categoryService.create(request.user.sub, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Category> {
    return this.categoryService.update(id, request.user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.categoryService.delete(id, request.user.sub);
  }
}
