import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AddViewDto {
    @IsInt()
    usuario_id: number;

    @IsInt()
    motocicleta_id: number;
}

export class AddSearchDto {
    @IsInt()
    usuario_id: number;

    @IsString()
    @IsNotEmpty()
    termino: string;
}
