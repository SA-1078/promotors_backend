import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { SystemLogsModule } from '../system-logs/system-logs.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        UsersModule,
        SystemLogsModule,
        MailModule,
        PassportModule,
        // Configuración asíncrona de JWT usando ConfigService
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                // En desarrollo, generamos un secret aleatorio cada vez que inicia el servidor
                // para invalidar sesiones anteriores automáticamente.
                const isProduction = configService.get('NODE_ENV') === 'production';
                const envSecret = configService.get<string>('JWT_SECRET');

                // Si hay secret en ENV, lo usamos (Prod). Si no, o si queremos forzar seguridad en dev, usamos aleatorio.
                // Para cumplir tu requerimiento: Si estamos en local (no production), concatenamos algo aleatorio
                // o usamos uno totalmente aleatorio si no hay config.

                const secret = isProduction && envSecret
                    ? envSecret
                    : (envSecret ? `${envSecret}-${Date.now()}` : `DevSecret-${Date.now()}`);

                return {
                    secret: secret,
                    signOptions: { expiresIn: '1h' },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
