import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema()
export class CartItem {
    @Prop({ required: true })
    motocicleta_id: number;

    @Prop({ required: true, min: 1 })
    cantidad: number;

    @Prop({ required: true })
    precio_unitario: number;

    @Prop({ required: true })
    subtotal: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ collection: 'carritos', timestamps: { updatedAt: 'fecha_actualizacion', createdAt: false } })
export class Cart {
    @Prop({ required: true, unique: true })
    usuario_id: number;

    @Prop({ type: [CartItemSchema], default: [] })
    items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
