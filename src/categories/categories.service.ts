import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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

    async findAll(queryDto: QueryDto): Promise<Pagination<Category>> {
        try {
            const { page, limit, search } = queryDto;
            const query = this.categoryRepository.createQueryBuilder('category');

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

    async remove(id: number): Promise<Category> {
        try {
            const category = await this.findOne(id);
            return await this.categoryRepository.remove(category);
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error deleting category with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to delete category');
        }
    }
}
