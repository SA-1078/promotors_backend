import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Motorcycle } from './motorcycle.entity';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class MotorcyclesService {
    constructor(
        @InjectRepository(Motorcycle)
        private readonly motorcycleRepository: Repository<Motorcycle>,
    ) { }

    async create(createMotorcycleDto: CreateMotorcycleDto): Promise<Motorcycle> {
        const motorcycle = this.motorcycleRepository.create(createMotorcycleDto);
        return await this.motorcycleRepository.save(motorcycle);
    }

    async findAll(queryDto: QueryDto): Promise<Pagination<Motorcycle>> {
        const { page, limit, search } = queryDto;
        const query = this.motorcycleRepository.createQueryBuilder('motorcycle')
            .leftJoinAndSelect('motorcycle.categoria', 'category');

        if (search) {
            query.where('motorcycle.nombre ILIKE :search', { search: `%${search}%` })
                .orWhere('motorcycle.marca ILIKE :search', { search: `%${search}%` })
                .orWhere('motorcycle.modelo ILIKE :search', { search: `%${search}%` });
        }

        query.orderBy('motorcycle.id_moto', 'DESC');

        return await paginate<Motorcycle>(query, { page, limit });
    }

    async findOne(id: number): Promise<Motorcycle | null> {
        return await this.motorcycleRepository.findOne({
            where: { id_moto: id },
            relations: ['categoria'],
        });
    }

    async update(id: number, updateMotorcycleDto: UpdateMotorcycleDto): Promise<Motorcycle | null> {
        const motorcycle = await this.findOne(id);
        if (!motorcycle) return null;

        Object.assign(motorcycle, updateMotorcycleDto);
        return await this.motorcycleRepository.save(motorcycle);
    }

    async remove(id: number): Promise<Motorcycle | null> {
        const motorcycle = await this.findOne(id);
        if (!motorcycle) return null;

        return await this.motorcycleRepository.remove(motorcycle);
    }
}
