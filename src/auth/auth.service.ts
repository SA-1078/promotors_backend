import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private systemLogsService: SystemLogsService,
        private mailService: MailService,
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

    private parseUserAgent(ua: string, secChUa: string = ''): string {
        // Check Client Hints first (More accurate for Brave and modern browsers)
        if (secChUa) {
            if (secChUa.includes('Brave')) return 'Brave';
            if (secChUa.includes('Edg')) return 'Edge';
            if (secChUa.includes('OPR') || secChUa.includes('Opera')) return 'Opera';
        }

        if (!ua) return 'Unknown';

        // Priority checks for browsers that are often based on others
        if (ua.includes('Brave')) return 'Brave'; // Fallback
        if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
        if (ua.includes('Vivaldi')) return 'Vivaldi';
        if (ua.includes('YaBrowser')) return 'Yandex';
        if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
        if (ua.includes('Edg')) return 'Edge';

        // Major browsers
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';

        return 'Navegador Web';
    }

    async login(loginDto: LoginDto, ip: string = 'Unknown', userAgent: string = 'Unknown', secChUa: string = '') {
        // Validar credenciales del usuario
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Normalize localhost IPv6
        const simpleIp = ip === '::1' ? '127.0.0.1' : ip;
        const browserName = this.parseUserAgent(userAgent, secChUa);

        // Automate: Log successful login
        await this.systemLogsService.create({
            usuario_id: user.id_usuario,
            accion: 'LOGIN',
            ip: simpleIp,
            detalles: {
                email: user.email,
                role: user.rol,
                browser: browserName,
                user_agent: userAgent
            }
        }).catch(() => { });

        // Automate: Alert if Admin Login
        if (user.rol === 'admin') {
            this.mailService.sendMail({
                to: process.env.MAIL_USER || '',
                subject: `⚠️ Alerta de Seguridad: Login Admin - ${user.nombre}`,
                message: `
                    <div style="font-family: Arial, sans-serif;">
                        <h2 style="color: #d32f2f;">Nuevo Ingreso Administrativo</h2>
                        <p>Se ha registrado un inicio de sesión con rol de <strong>ADMINISTRADOR</strong>.</p>
                        <ul>
                            <li><strong>Usuario:</strong> ${user.nombre} (${user.email})</li>
                            <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
                            <li><strong>IP:</strong> ${simpleIp}</li>
                            <li><strong>Navegador:</strong> ${browserName}</li>
                        </ul>
                        <p style="color: #666; font-size: 12px;">Si no fuiste tú, revisa los logs del sistema inmediatamente.</p>
                    </div>
                `
            }).catch(err => console.warn(`Error sending login alert: ${err.message}`));
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
