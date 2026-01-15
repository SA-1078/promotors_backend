import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { SuccessResponseDto } from '../../common/dto/response.dto';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    const mockUser = {
        id_usuario: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        rol: 'cliente',
    };

    const mockAuthService = {
        login: jest.fn(),
        register: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('debería devolver access token y usuario en caso de login exitoso', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const loginResult = {
                access_token: 'jwt.token.here',
                user: mockUser,
            };

            mockAuthService.login.mockResolvedValue(loginResult);

            const result = await controller.login(loginDto);

            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Login successful');
            expect(result.data).toEqual(loginResult);
            expect(result.data.access_token).toBe('jwt.token.here');
        });

        it('debería lanzar UnauthorizedException para credenciales inválidas', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            mockAuthService.login.mockRejectedValue(
                new UnauthorizedException('Credenciales inválidas'),
            );

            await expect(controller.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('register', () => {
        it('debería registrar un nuevo usuario correctamente', async () => {
            const registerDto: RegisterDto = {
                nombre: 'New User',
                email: 'newuser@example.com',
                telefono: '0999999999',
                password: 'password123',
            };

            mockAuthService.register.mockResolvedValue(mockUser);

            const result = await controller.register(registerDto);

            expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('User registered successfully');
            expect(result.data).toEqual(mockUser);
        });

        it('debería registrar un administrador con un código secreto válido', async () => {
            const registerDto: RegisterDto = {
                nombre: 'Admin User',
                email: 'admin@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'admin',
                codigo_secreto: 'SECRET123',
            };

            const adminUser = { ...mockUser, rol: 'admin' };
            mockAuthService.register.mockResolvedValue(adminUser);

            const result = await controller.register(registerDto);

            expect(result.data.rol).toBe('admin');
        });

        it('debería lanzar ForbiddenException para código secreto inválido', async () => {
            const registerDto: RegisterDto = {
                nombre: 'Admin User',
                email: 'admin@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'admin',
                codigo_secreto: 'WRONG_CODE',
            };

            mockAuthService.register.mockRejectedValue(
                new ForbiddenException('Código secreto inválido para el rol solicitado'),
            );

            await expect(controller.register(registerDto)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('debería manejar errores del servicio', async () => {
            const registerDto: RegisterDto = {
                nombre: 'New User',
                email: 'newuser@example.com',
                telefono: '0999999999',
                password: 'password123',
            };

            mockAuthService.register.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(controller.register(registerDto)).rejects.toThrow();
        });
    });
});
