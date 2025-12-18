import { IsArray, IsInt, IsNotEmpty, IsNumber, Min, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
    @IsInt()
    motocicleta_id: number;

    @IsInt()
    @Min(1)
    cantidad: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    precio_unitario?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    subtotal?: number;
}

export class CreateCartDto {
    @IsInt()
    usuario_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    items: CartItemDto[];
}
