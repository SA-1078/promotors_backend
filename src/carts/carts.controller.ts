import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('carts')
export class CartsController {
    constructor(private readonly cartsService: CartsService) { }

    @Post()
    async updateCart(@Body() dto: CreateCartDto) {
        // Crear o actualizar el carrito de compras del usuario
        const cart = await this.cartsService.createOrUpdate(dto);
        return new SuccessResponseDto('Cart updated successfully', cart);
    }

    @Get('user/:id')
    async findByUser(@Param('id', ParseIntPipe) id: number) {
        const cart = await this.cartsService.findByUser(id);
        return new SuccessResponseDto('Cart retrieved successfully', cart || { items: [] });
    }

    @Delete('user/:id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        // Vaciar el carrito del usuario
        await this.cartsService.delete(id);
        return new SuccessResponseDto('Cart cleared successfully', null);
    }
}
