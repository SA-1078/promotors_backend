import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { MotorcyclesService } from '../motorcycles/motorcycles.service';

@Injectable()
export class CartsService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        private readonly motorcyclesService: MotorcyclesService,
    ) { }

    async createOrUpdate(createCartDto: CreateCartDto): Promise<Cart> {
        const { usuario_id, items } = createCartDto;

        // Automate: Calculate prices
        for (const item of items) {
            const moto = await this.motorcyclesService.findOne(item.motocicleta_id);
            if (!moto) {
                throw new Error(`Motorcycle with ID ${item.motocicleta_id} not found`);
            }
            item.precio_unitario = moto.precio;
            item.subtotal = moto.precio * item.cantidad;
        }

        // Verificar si el usuario ya tiene un carrito
        let cart = await this.cartModel.findOne({ usuario_id });

        if (cart) {
            // Si existe, actualizar los items (reemplazo completo del estado local)
            cart.items = items as any;
            return cart.save();
        } else {
            // Si no existe, crear nuevo carrito
            const newCart = new this.cartModel(createCartDto);
            return newCart.save();
        }
    }

    async findByUser(userId: number): Promise<Cart | null> {
        return this.cartModel.findOne({ usuario_id: userId }).exec();
    }

    async delete(userId: number): Promise<any> {
        return this.cartModel.deleteOne({ usuario_id: userId }).exec();
    }
}
