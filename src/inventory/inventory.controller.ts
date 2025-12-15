import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Post()
    async create(@Body() dto: CreateInventoryDto) {
        // Registrar nuevo movimiento de inventario (entrada/salida se define en el DTO o lógica)
        const inventory = await this.inventoryService.create(dto);
        return new SuccessResponseDto('Inventory item created successfully', inventory);
    }

    @Get()
    async findAll(@Query() query: QueryDto): Promise<SuccessResponseDto<Pagination<Inventory>>> {
        // Listar historial de inventario paginado
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInventoryDto) {
        const inventory = await this.inventoryService.update(id, dto);
        if (!inventory) throw new NotFoundException('Inventory item not found');
        return new SuccessResponseDto('Inventory item updated successfully', inventory);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const inventory = await this.inventoryService.remove(id);
        if (!inventory) throw new NotFoundException('Inventory item not found');
        return new SuccessResponseDto('Inventory item deleted successfully', inventory);
    }
}
