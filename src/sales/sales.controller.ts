import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Sale } from './sale.entity';
import { QueryDto } from '../common/dto/query.dto';

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    async create(@Body() dto: CreateSaleDto) {
        // Registrar venta incluyendo sus detalles (productos, cantidades)
        const sale = await this.salesService.create(dto);
        return new SuccessResponseDto('Sale created successfully', sale);
    }

    @Get()
    async findAll(@Query() query: QueryDto): Promise<SuccessResponseDto<Pagination<Sale>>> {
        if (query.limit && query.limit > 100) query.limit = 100;
        const result = await this.salesService.findAll(query);
        return new SuccessResponseDto('Sales retrieved successfully', result);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const sale = await this.salesService.findOne(id);
        if (!sale) throw new NotFoundException('Sale not found');
        return new SuccessResponseDto('Sale retrieved successfully', sale);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaleDto) {
        const sale = await this.salesService.update(id, dto);
        if (!sale) throw new NotFoundException('Sale not found');
        return new SuccessResponseDto('Sale updated successfully', sale);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const sale = await this.salesService.remove(id);
        if (!sale) throw new NotFoundException('Sale not found');
        return new SuccessResponseDto('Sale deleted successfully', sale);
    }
}
