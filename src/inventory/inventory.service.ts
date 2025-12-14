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
        const query = this.inventoryRepository.createQueryBuilder('inventory')
            .leftJoinAndSelect('inventory.motorcycle', 'motorcycle');

        query.orderBy('inventory.id_inventario', 'DESC');

        return await paginate<Inventory>(query, { page, limit });
    }

    async findOne(id: number): Promise<Inventory | null> {
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
}
