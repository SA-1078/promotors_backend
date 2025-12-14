import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateInventoryDto {
    @IsInt()
    id_moto: number;

    @IsInt()
    @Min(0)
    stock_actual: number;

    @IsString()
    @IsNotEmpty()
    ubicacion: string;
}
