import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
    ) { }

    async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
        try {
            const inventory = this.inventoryRepository.create(createInventoryDto);
            return await this.inventoryRepository.save(inventory);
        } catch (err) {
            this.logger.error('Error creating inventory', err.stack);
            throw new InternalServerErrorException('Failed to create inventory');
        }
    }

    async findAll(queryDto: QueryDto): Promise<Pagination<Inventory>> {
        try {
            const { page, limit } = queryDto;
            // Consultar inventario con datos de la moto relacionada
            const query = this.inventoryRepository.createQueryBuilder('inventory')
                .leftJoinAndSelect('inventory.motorcycle', 'motorcycle');

            if (queryDto.withDeleted === 'true') {
                query.withDeleted();
            }

            // Ordenar por fecha de creación descendente (asumiendo id autoincremental refleja tiempo)
            query.orderBy('inventory.id_inventario', 'DESC');

            return await paginate<Inventory>(query, { page, limit });
        } catch (err) {
            this.logger.error('Error retrieving inventory', err.stack);
            throw new InternalServerErrorException('Failed to retrieve inventory');
        }
    }

    async findOne(id: number): Promise<Inventory> {
        try {
            // Obtener detalle de registro de inventario específico
            const inventory = await this.inventoryRepository.findOne({
                where: { id_inventario: id },
                relations: ['motorcycle'],
            });
            if (!inventory) {
                throw new NotFoundException(`Inventory item with ID ${id} not found`);
            }
            return inventory;
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error finding inventory with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to find inventory');
        }
    }

    async update(id: number, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
        try {
            const inventory = await this.findOne(id);
            Object.assign(inventory, updateInventoryDto);
            return await this.inventoryRepository.save(inventory);
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error updating inventory with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to update inventory');
        }
    }

    async remove(id: number): Promise<Inventory> {
        try {
            const inventory = await this.findOne(id);
            return await this.inventoryRepository.remove(inventory);
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Error deleting inventory with ID ${id}`, err.stack);
            throw new InternalServerErrorException('Failed to delete inventory');
        }
    }

    async reduceStock(motoId: number, quantity: number): Promise<void> {
        try {
            const inventory = await this.inventoryRepository.findOne({ where: { id_moto: motoId } });
            if (!inventory) {
                // If inventory doesn't exist, we can't reduce stock. 
                // However, for consistency, maybe we should warn? 
                // For now, let's throw NotFound to match previous logic
                throw new NotFoundException(`Inventory not found for motorcycle ID ${motoId}`);
            }
            if (inventory.stock_actual < quantity) {
                throw new BadRequestException(`Insufficient stock for motorcycle ID ${motoId}. Available: ${inventory.stock_actual}, Requested: ${quantity}`);
            }
            inventory.stock_actual -= quantity;
            await this.inventoryRepository.save(inventory);
        } catch (err) {
            if (err instanceof NotFoundException || err instanceof BadRequestException) {
                throw err;
            }
            this.logger.error(`Error reducing stock for motorcycle ID ${motoId}`, err.stack);
            throw new InternalServerErrorException('Failed to reduce stock');
        }
    }

    async removeByMotorcycleId(motoId: number): Promise<void> {
        try {
            const inventory = await this.inventoryRepository.findOne({ where: { id_moto: motoId } });
            if (inventory) {
                await this.inventoryRepository.remove(inventory);
            }
        } catch (err) {
            this.logger.error(`Error deleting inventory for motorcycle ID ${motoId}`, err.stack);
            // We don't throw here to allow motorcycle deletion to proceed even if inventory deletion fails (or maybe we should?)
            // Given the requirement "delete everything", if this fails, likely the Moto delete will fail too on constraints.
            throw new InternalServerErrorException('Failed to delete inventory for motorcycle');
        }
    }
}
