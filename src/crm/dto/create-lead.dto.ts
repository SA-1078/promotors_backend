import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeadDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    telefono: string;

    @IsString()
    @IsNotEmpty()
    mensaje: string;

    @IsString()
    @IsNotEmpty()
    estado: string;
}
