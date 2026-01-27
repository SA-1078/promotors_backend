import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
    @IsString()
    @IsNotEmpty()
    comentario: string;

    @IsInt()
    @Min(1)
    @Max(5)
    calificacion: number;
}
