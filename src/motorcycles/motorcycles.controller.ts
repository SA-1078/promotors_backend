import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MotorcyclesService } from './motorcycles.service';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Motorcycle } from './motorcycle.entity';
import { QueryDto } from '../common/dto/query.dto';

@Controller('motorcycles')
export class MotorcyclesController {
    constructor(private readonly motorcyclesService: MotorcyclesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Post()
    async create(@Body() dto: CreateMotorcycleDto) {
        // Solo administradores y empleados pueden crear motos
        const motorcycle = await this.motorcyclesService.create(dto);
        return new SuccessResponseDto('Motorcycle created successfully', motorcycle);
    }

    @Get()
    async findAll(@Query() query: QueryDto): Promise<SuccessResponseDto<Pagination<Motorcycle>>> {
        // Límite de paginación para evitar sobrecarga
        if (query.limit && query.limit > 100) query.limit = 100;
        const result = await this.motorcyclesService.findAll(query);
        return new SuccessResponseDto('Motorcycles retrieved successfully', result);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const motorcycle = await this.motorcyclesService.findOne(id);
        if (!motorcycle) throw new NotFoundException('Motorcycle not found');
        return new SuccessResponseDto('Motorcycle retrieved successfully', motorcycle);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMotorcycleDto) {
        const motorcycle = await this.motorcyclesService.update(id, dto);
        if (!motorcycle) throw new NotFoundException('Motorcycle not found');
        return new SuccessResponseDto('Motorcycle updated successfully', motorcycle);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const motorcycle = await this.motorcyclesService.remove(id);
        if (!motorcycle) throw new NotFoundException('Motorcycle not found');
        return new SuccessResponseDto('Motorcycle deleted successfully', motorcycle);
    }
}
