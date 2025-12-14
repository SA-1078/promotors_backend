import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
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

    @IsString()
    @IsIn(['admin', 'empleado', 'cliente'])
    rol: string;
}
