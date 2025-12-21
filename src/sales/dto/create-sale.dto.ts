import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleDetailDto {
    @IsInt()
    id_moto: number;

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

export class CreateSaleDto {
    @IsInt()
    id_usuario: number;

    @IsNumber()
    @Min(0)
    total: number;

    @IsString()
    @IsNotEmpty()
    metodo_pago: string;

    @IsString()
    @IsNotEmpty()
    estado: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSaleDetailDto)
    detalles: CreateSaleDetailDto[];
}
