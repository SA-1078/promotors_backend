import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        // Buscar usuario por email
        const user = await this.usersService.findByEmail(email);
        // Validar si el usuario existe y si la contraseña coincide
        if (user && await bcrypt.compare(pass, user.password_hash)) {
            // Eliminar password_hash del objeto resultante por seguridad
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        // Validar credenciales del usuario
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        // Crear payload del token
        const payload = { email: user.email, sub: user.id_usuario, role: user.rol };
        return {
            // Generar y firmar el token JWT
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async register(registerDto: RegisterDto) {
        // Registrar nuevo usuario
        let role = 'cliente';

        // Si intenta registrarse como admin o empleado, verificar código secreto
        if (registerDto.rol && ['admin', 'empleado'].includes(registerDto.rol)) {
            const secretCode = process.env.ADMIN_SECRET_CODE; // Debería estar en variables de entorno
            if (registerDto.codigo_secreto !== secretCode) {
                throw new ForbiddenException('Código secreto inválido para el rol solicitado');
            }
            role = registerDto.rol;
        }

        // Registrar nuevo usuario
        const { codigo_secreto, ...userData } = registerDto;
        return this.usersService.create({
            ...userData,
            rol: role,
        });
    }
}
