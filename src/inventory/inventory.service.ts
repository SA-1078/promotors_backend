import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
    ) { }

    async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
        const inventory = this.inventoryRepository.create(createInventoryDto);
        return await this.inventoryRepository.save(inventory);
    }

    async findAll(queryDto: QueryDto): Promise<Pagination<Inventory>> {
        const { page, limit } = queryDto;
        // Consultar inventario con datos de la moto relacionada
        const query = this.inventoryRepository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.motorcycle', 'motorcycle');

        // Ordenar por fecha de creación descendente (asumiendo id autoincremental refleja tiempo)
        query.orderBy('inventory.id_inventario', 'DESC');

        return await paginate<Inventory>(query, { page, limit });
    }

    async findOne(id: number): Promise<Inventory | null> {
        // Obtener detalle de registro de inventario específico
        return await this.inventoryRepository.findOne({
            where: { id_inventario: id },
            relations: ['motorcycle'],
        });
    }

    async update(id: number, updateInventoryDto: UpdateInventoryDto): Promise<Inventory | null> {
        const inventory = await this.findOne(id);
        if (!inventory) return null;

        Object.assign(inventory, updateInventoryDto);
        return await this.inventoryRepository.save(inventory);
    }

    async remove(id: number): Promise<Inventory | null> {
        const inventory = await this.findOne(id);
        if (!inventory) return null;

        return await this.inventoryRepository.remove(inventory);
    }

    async reduceStock(motoId: number, quantity: number): Promise<void> {
        const inventory = await this.inventoryRepository.findOne({ where: { id_moto: motoId } });
        if (!inventory) {
            throw new Error(`Inventory not found for motorcycle ID ${motoId}`);
        }
        if (inventory.stock_actual < quantity) {
            throw new Error(`Insufficient stock for motorcycle ID ${motoId}. Available: ${inventory.stock_actual}, Requested: ${quantity}`);
        }
        inventory.stock_actual -= quantity;
        await this.inventoryRepository.save(inventory);
    }
}
