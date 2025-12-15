import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

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
}
