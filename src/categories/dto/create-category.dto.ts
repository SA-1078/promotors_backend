import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}
