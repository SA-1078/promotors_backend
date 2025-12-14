import { IsArray, IsInt, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
    @IsInt()
    motocicleta_id: number;

    @IsInt()
    @Min(1)
    cantidad: number;

    @IsNumber()
    @Min(0)
    precio_unitario: number;

    @IsNumber()
    @Min(0)
    subtotal: number;
}

export class CreateCartDto {
    @IsInt()
    usuario_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    items: CartItemDto[];
}
