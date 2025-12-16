import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    telefono: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    @IsIn(['admin', 'empleado', 'cliente'])
    rol?: string;

    @IsOptional()
    @IsString()
    codigo_secreto?: string;
}
