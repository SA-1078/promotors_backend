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
    private resetCodes = new Map<string, { code: string; expiresAt: Date }>();

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
        const newUser = await this.usersService.create({
            ...userData,
            rol: role,
        });

        // Generar token JWT para login automático
        const { password_hash, ...userWithoutPassword } = newUser;
        const payload = { email: newUser.email, sub: newUser.id_usuario, role: newUser.rol };

        return {
            access_token: this.jwtService.sign(payload),
            user: userWithoutPassword,
        };
    }

    async requestPasswordReset(email: string) {
        // Verificar si el usuario existe
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Por seguridad, no revelamos si el email existe o no
            return { message: 'Si el correo existe, recibirás un código de verificación' };
        }

        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Guardar código con expiración de 15 minutos
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        this.resetCodes.set(email, { code, expiresAt });

        // Enviar email con el código
        await this.mailService.sendMail({
            to: email,
            subject: '🔐 Código de Recuperación de Contraseña - MotoRShop',
            message: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Recuperación de Contraseña</h1>
                    </div>
                    <div style="background: #f7fafc; padding: 40px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #2d3748; margin-bottom: 20px;">Hola <strong>${user.nombre}</strong>,</p>
                        <p style="font-size: 16px; color: #2d3748; margin-bottom: 30px;">Has solicitado restablecer tu contraseña. Usa el siguiente código de verificación:</p>
                        
                        <div style="background: white; border: 3px dashed #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
                            <p style="font-size: 14px; color: #718096; margin: 0 0 10px 0;">Tu código de verificación:</p>
                            <p style="font-size: 42px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                        </div>

                        <p style="font-size: 14px; color: #718096; margin-bottom: 20px;">
                            ⏰ Este código expirará en <strong>15 minutos</strong>.
                        </p>

                        <p style="font-size: 14px; color: #e53e3e; background: #fff5f5; padding: 15px; border-left: 4px solid #e53e3e; border-radius: 4px;">
                            ⚠️ Si no solicitaste este cambio, puedes ignorar este mensaje.
                        </p>

                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="font-size: 12px; color: #a0aec0; margin: 0;">MotoRShop - Sistema de Gestión</p>
                        </div>
                    </div>
                </div>
            `
        });

        return { message: 'Si el correo existe, recibirás un código de verificación' };
    }

    async resetPassword(email: string, code: string, newPassword: string) {
        // Verificar si existe un código para este email
        const storedData = this.resetCodes.get(email);
        if (!storedData) {
            throw new UnauthorizedException('Código inválido o expirado');
        }

        // Verificar si el código ha expirado
        if (new Date() > storedData.expiresAt) {
            this.resetCodes.delete(email);
            throw new UnauthorizedException('El código ha expirado. Solicita uno nuevo');
        }

        // Verificar si el código es correcto
        if (storedData.code !== code) {
            throw new UnauthorizedException('Código incorrecto');
        }

        // Buscar usuario
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        // Actualizar contraseña
        await this.usersService.update(user.id_usuario, { password: newPassword });

        // Eliminar el código usado
        this.resetCodes.delete(email);

        // Log de cambio de contraseña
        await this.systemLogsService.create({
            usuario_id: user.id_usuario,
            accion: 'PASSWORD_RESET',
            ip: 'Sistema',
            detalles: {
                email: user.email,
                timestamp: new Date().toISOString()
            }
        }).catch(() => { });

        return { message: 'Contraseña actualizada exitosamente' };
    }
}
