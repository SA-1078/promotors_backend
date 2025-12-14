import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoryRepository.create(createCategoryDto);
        return await this.categoryRepository.save(category);
    }

    async findAll(queryDto: QueryDto): Promise<Pagination<Category>> {
        const { page, limit, search } = queryDto;
        const query = this.categoryRepository.createQueryBuilder('category');

        if (search) {
            query.where('category.nombre ILIKE :search', { search: `%${search}%` });
        }

        query.orderBy('category.id_categoria', 'ASC');

        return await paginate<Category>(query, { page, limit });
    }

    async findOne(id: number): Promise<Category | null> {
        return await this.categoryRepository.findOne({ where: { id_categoria: id } });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category | null> {
        const category = await this.findOne(id);
        if (!category) return null;

        Object.assign(category, updateCategoryDto);
        return await this.categoryRepository.save(category);
    }

    async remove(id: number): Promise<Category | null> {
        const category = await this.findOne(id);
        if (!category) return null;

        return await this.categoryRepository.remove(category);
    }
}
