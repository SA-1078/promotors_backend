import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            // Extraer token del header Authorization: Bearer <token>
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // No ignorar expiración del token
            ignoreExpiration: false,
            // Usar clave secreta definida en variables de entorno
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey', // Fallback for dev only
        });
    }

    async validate(payload: any) {
        // Validar payload del token
        if (!payload) {
            throw new UnauthorizedException();
        }
        // Retornar datos básicos del usuario para inyectar en request.user
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}
