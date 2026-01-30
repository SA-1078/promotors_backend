import { IsString, IsOptional, IsBoolean, IsInt, MaxLength } from 'class-validator';

export class CreateFaqDto {
    @IsString()
    @MaxLength(500)
    pregunta: string;

    @IsString()
    respuesta: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    categoria?: string;

    @IsOptional()
    @IsInt()
    orden?: number;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
