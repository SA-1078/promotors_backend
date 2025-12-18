import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { MotorcyclesModule } from '../motorcycles/motorcycles.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        MotorcyclesModule
    ],
    controllers: [CartsController],
    providers: [CartsService],
})
export class CartsModule { }
