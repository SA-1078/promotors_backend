import { IsNumber, IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class CreateSaleItemDto {
    @IsNumber()
    id_moto: number;

    @IsNumber()
    cantidad: number;

    @IsNumber()
    precio_unitario: number;
}

export class CreateDirectSaleDto {
    @IsNumber()
    id_usuario: number;

    @IsNumber()
    total: number;

    @IsString()
    metodo_pago: string; // 'Efectivo', 'PayPal', 'Transferencia'

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => CreateSaleItemDto)
    detalles: CreateSaleItemDto[];
}
