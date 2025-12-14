import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe
} from '@nestjs/common';
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

    @Post()
    async create(@Body() dto: CreateMotorcycleDto) {
        const motorcycle = await this.motorcyclesService.create(dto);
        return new SuccessResponseDto('Motorcycle created successfully', motorcycle);
    }

    @Get()
    async findAll(@Query() query: QueryDto): Promise<SuccessResponseDto<Pagination<Motorcycle>>> {
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

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMotorcycleDto) {
        const motorcycle = await this.motorcyclesService.update(id, dto);
        if (!motorcycle) throw new NotFoundException('Motorcycle not found');
        return new SuccessResponseDto('Motorcycle updated successfully', motorcycle);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const motorcycle = await this.motorcyclesService.remove(id);
        if (!motorcycle) throw new NotFoundException('Motorcycle not found');
        return new SuccessResponseDto('Motorcycle deleted successfully', motorcycle);
    }
}
