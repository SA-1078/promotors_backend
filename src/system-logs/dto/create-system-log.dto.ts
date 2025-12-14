import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateSystemLogDto {
    @IsInt()
    usuario_id: number;

    @IsString()
    @IsNotEmpty()
    accion: string;

    @IsString()
    @IsOptional()
    ip?: string;

    @IsObject()
    @IsOptional()
    detalles?: Record<string, any>;
}
