import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartsService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    ) { }

    async createOrUpdate(createCartDto: CreateCartDto): Promise<Cart> {
        const { usuario_id, items } = createCartDto;

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
