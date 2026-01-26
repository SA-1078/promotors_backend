import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Category } from './category.entity';
import { QueryDto } from '../common/dto/query.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Post()
    async create(@Body() dto: CreateCategoryDto) {
        const category = await this.categoriesService.create(dto);
        return new SuccessResponseDto('Category created successfully', category);
    }

    @Get()
    async findAll(@Query() query: QueryDto, @Query('withDeleted') withDeleted?: string): Promise<SuccessResponseDto<Pagination<Category>>> {
        if (query.limit && query.limit > 100) query.limit = 100;
        const result = await this.categoriesService.findAll(query, {
            withDeleted: withDeleted === 'true'
        });
        return new SuccessResponseDto('Categories retrieved successfully', result);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const category = await this.categoriesService.findOne(id);
        if (!category) throw new NotFoundException('Category not found');
        return new SuccessResponseDto('Category retrieved successfully', category);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
        const category = await this.categoriesService.update(id, dto);
        if (!category) throw new NotFoundException('Category not found');
        return new SuccessResponseDto('Category updated successfully', category);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number, @Query('type') type?: 'soft' | 'hard') {
        // Solo el administrador puede eliminar categorías
        const deleteType = type || 'soft'; // Default a soft delete
        const category = await this.categoriesService.remove(id, deleteType);
        if (!category) throw new NotFoundException('Category not found');
        return new SuccessResponseDto(
            deleteType === 'soft'
                ? 'Category soft deleted successfully'
                : 'Category permanently deleted successfully',
            category
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post(':id/restore')
    async restore(@Param('id', ParseIntPipe) id: number) {
        const category = await this.categoriesService.restore(id);
        return new SuccessResponseDto('Category restored successfully', category);
    }
}
