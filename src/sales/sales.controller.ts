import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe, UseGuards, Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

    @UseGuards(JwtAuthGuard)
    @Get('my-orders')
    async getMyOrders(@Request() req: any) {
        const orders = await this.salesService.findByUser(req.user.id_usuario);
        return new SuccessResponseDto('Your orders retrieved successfully', orders);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Post()
    async create(@Body() dto: CreateSaleDto) {
        // Registrar venta incluyendo sus detalles (productos, cantidades)
        // Solo admin y empleado pueden registrar ventas
        const sale = await this.salesService.create(dto);
        return new SuccessResponseDto('Sale created successfully', sale);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Get()
    async findAll(@Query() query: QueryDto): Promise<SuccessResponseDto<Pagination<Sale>>> {
        if (query.limit && query.limit > 100) query.limit = 100;
        const result = await this.salesService.findAll(query);
        return new SuccessResponseDto('Sales retrieved successfully', result);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const sale = await this.salesService.findOne(id);
        if (!sale) throw new NotFoundException('Sale not found');
        return new SuccessResponseDto('Sale retrieved successfully', sale);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSaleDto) {
        const sale = await this.salesService.update(id, dto);
        if (!sale) throw new NotFoundException('Sale not found');
        return new SuccessResponseDto('Sale updated successfully', sale);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        // Solo admin puede eliminar ventas
        const sale = await this.salesService.remove(id);
        if (!sale) throw new NotFoundException('Sale not found');
        return new SuccessResponseDto('Sale deleted successfully', sale);
    }
}
