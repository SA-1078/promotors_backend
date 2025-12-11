import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMotorcycleDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    marca: string;

    @IsString()
    @IsNotEmpty()
    modelo: string;

    @IsInt()
    @Min(1900)
    anio: number;

    @IsNumber()
    @Min(0)
    precio: number;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsInt()
    id_categoria: number;

    @IsString()
    @IsNotEmpty()
    imagen_url: string;
}
