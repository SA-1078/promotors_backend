import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Motorcycle } from './motorcycle.entity';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class MotorcyclesService {
    private readonly logger = new Logger(MotorcyclesService.name);

    constructor(
        @InjectRepository(Motorcycle)
        private readonly motorcycleRepository: Repository<Motorcycle>,
    ) { }

    async create(createMotorcycleDto: CreateMotorcycleDto): Promise<Motorcycle> {
        try {
            const motorcycle = this.motorcycleRepository.create(createMotorcycleDto);
            return await this.motorcycleRepository.save(motorcycle);
        } catch (err) {
            this.logger.error('Error creating motorcycle', err.stack);
            throw new InternalServerErrorException('Failed to create motorcycle');
        }
    }

    async findAll(queryDto: QueryDto): Promise<Pagination<Motorcycle>> {
        try {
            const { page, limit, search } = queryDto;
            // QueryBuilder para consultas complejas con relaciones
            const query = this.motorcycleRepository.createQueryBuilder('motorcycle')
                .leftJoinAndSelect('motorcycle.categoria', 'category');

            if (search) {
                // Búsqueda en múltiples columnas (nombre, marca, modelo)
                // Fix: Usar parámetros nombrados para todas las condiciones
                query.where(
                    '(motorcycle.nombre ILIKE :search OR motorcycle.marca ILIKE :search OR motorcycle.modelo ILIKE :search)',
                    { search: `%${search}%` }
                );
            }

            query.orderBy('motorcycle.id_moto', 'DESC');

            return await paginate<Motorcycle>(query, { page, limit });
        } catch (err) {
            this.logger.error('Error retrieving motorcycles', err.stack);
            throw new InternalServerErrorException('Failed to retrieve motorcycles');
        }
    }

    async findOne(id: number): Promise<Motorcycle> {
        try {
            // Buscar moto por ID incluyendo la relación con categoría
            const motorcycle = await this.motorcycleRepository.findOne({
                where: { id_moto: id },
                relations: ['categoria'],
            });
            if (!motorcycle) {
                throw new NotFoundException(`Motorcycle with ID ${id} not found`);
            }
            return motorcycle;
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error finding motorcycle with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to find motorcycle');
        }
    }

    async update(id: number, updateMotorcycleDto: UpdateMotorcycleDto): Promise<Motorcycle> {
        try {
            const motorcycle = await this.findOne(id);
            Object.assign(motorcycle, updateMotorcycleDto);
            return await this.motorcycleRepository.save(motorcycle);
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error updating motorcycle with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to update motorcycle');
        }
    }

    async remove(id: number): Promise<Motorcycle> {
        try {
            const motorcycle = await this.findOne(id);
            return await this.motorcycleRepository.remove(motorcycle);
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error deleting motorcycle with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to delete motorcycle');
        }
    }
}
