import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, Max, Min, IsString } from 'class-validator';

export class CreateCommentDto {
    @IsInt()
    usuario_id: number;

    @IsInt()
    motocicleta_id: number;

    @IsNumber()
    @Min(1)
    @Max(5)
    calificacion: number;

    @IsString()
    @IsNotEmpty()
    comentario: string;

    @IsBoolean()
    @IsOptional()
    moderado?: boolean;
}
