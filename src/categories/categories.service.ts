import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);

    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        try {
            const category = this.categoryRepository.create(createCategoryDto);
            return await this.categoryRepository.save(category);
        } catch (err) {
            this.logger.error('Error creating category', err.stack);
            throw new InternalServerErrorException('Failed to create category');
        }
    }

    async findAll(queryDto: QueryDto, options?: { withDeleted?: boolean }): Promise<Pagination<Category>> {
        try {
            const { page, limit, search } = queryDto;
            const query = this.categoryRepository.createQueryBuilder('category');

            // Include soft-deleted if requested
            if (options?.withDeleted) {
                query.withDeleted();
            }

            if (search) {
                // Filtrar categorías por nombre
                query.where('category.nombre ILIKE :search', { search: `%${search}%` });
            }

            query.orderBy('category.id_categoria', 'ASC');

            return await paginate<Category>(query, { page, limit });
        } catch (err) {
            this.logger.error('Error retrieving categories', err.stack);
            throw new InternalServerErrorException('Failed to retrieve categories');
        }
    }

    async findOne(id: number): Promise<Category> {
        try {
            const category = await this.categoryRepository.findOne({ where: { id_categoria: id } });
            if (!category) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }
            return category;
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error finding category with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to find category');
        }
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        try {
            const category = await this.findOne(id);
            Object.assign(category, updateCategoryDto);
            return await this.categoryRepository.save(category);
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error updating category with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to update category');
        }
    }

    async remove(id: number, type: 'soft' | 'hard' = 'soft'): Promise<Category> {
        try {
            const category = await this.categoryRepository.findOne({
                where: { id_categoria: id },
                withDeleted: true // Find even if soft-deleted
            });

            if (!category) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }

            if (type === 'soft') {
                // Soft delete
                await this.categoryRepository.softRemove(category);
                return category;
            } else {
                // Hard delete - permanent removal
                return await this.categoryRepository.remove(category);
            }
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            // Check if error is due to foreign key constraint
            if (err.code === '23503') {
                throw new BadRequestException(
                    'No se puede eliminar esta categoría porque tiene motocicletas asociadas. ' +
                    'Primero elimina o reasigna las motocicletas.'
                );
            }
            this.logger.error(`Error deleting category with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to delete category');
        }
    }

    async restore(id: number): Promise<Category> {
        try {
            const category = await this.categoryRepository.findOne({
                where: { id_categoria: id },
                withDeleted: true
            });

            if (!category) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }

            if (!category.deletedAt) {
                throw new BadRequestException('Category is not deleted');
            }

            await this.categoryRepository.restore(id);
            return await this.findOne(id);
        } catch (err) {
            if (err instanceof NotFoundException || err instanceof BadRequestException) {
                throw err;
            }
            this.logger.error(`Error restoring category with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to restore category');
        }
    }
}
