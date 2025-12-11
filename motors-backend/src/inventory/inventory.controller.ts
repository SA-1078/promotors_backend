import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Inventory } from './inventory.entity';
import { QueryDto } from '../common/dto/query.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post()
    async create(@Body() dto: CreateInventoryDto) {
        const inventory = await this.inventoryService.create(dto);
        return new SuccessResponseDto('Inventory item created successfully', inventory);
    }

    @Get()
    async findAll(@Query() query: QueryDto): Promise<SuccessResponseDto<Pagination<Inventory>>> {
        if (query.limit && query.limit > 100) query.limit = 100;
        const result = await this.inventoryService.findAll(query);
        return new SuccessResponseDto('Inventory items retrieved successfully', result);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const inventory = await this.inventoryService.findOne(id);
        if (!inventory) throw new NotFoundException('Inventory item not found');
        return new SuccessResponseDto('Inventory item retrieved successfully', inventory);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryDto) {
        const inventory = await this.inventoryService.update(id, dto);
        if (!inventory) throw new NotFoundException('Inventory item not found');
        return new SuccessResponseDto('Inventory item updated successfully', inventory);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const inventory = await this.inventoryService.remove(id);
        if (!inventory) throw new NotFoundException('Inventory item not found');
        return new SuccessResponseDto('Inventory item deleted successfully', inventory);
    }
}
