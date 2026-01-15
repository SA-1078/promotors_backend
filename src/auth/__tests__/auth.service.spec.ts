import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SystemLogsService } from '../../system-logs/system-logs.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;
    let systemLogsService: SystemLogsService;

    const mockUser = {
        id_usuario: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        telefono: '0999999999',
        password_hash: 'hashedPassword123',
        rol: 'cliente',
        fecha_registro: new Date(),
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
        create: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockSystemLogsService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: SystemLogsService,
                    useValue: mockSystemLogsService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        systemLogsService = module.get<SystemLogsService>(SystemLogsService);

        jest.clearAllMocks();

        process.env.ADMIN_SECRET_CODE = 'SECRET123';
    });

    afterEach(() => {
        delete process.env.ADMIN_SECRET_CODE;
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('debería devolver los datos del usuario sin contraseña cuando las credenciales son válidas', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'password123');

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
            expect(result).not.toHaveProperty('password_hash');
            expect(result.email).toBe('test@example.com');
        });

        it('debería devolver null cuando el usuario no se encuentra', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            const result = await service.validateUser('notfound@example.com', 'password123');

            expect(result).toBeNull();
        });

        it('debería devolver null cuando la contraseña es incorrecta', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser('test@example.com', 'wrongpassword');

            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('debería devolver access token y datos del usuario en caso de login exitoso', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('jwt.token.here');
            mockSystemLogsService.create.mockResolvedValue({});

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('user');
            expect(result.access_token).toBe('jwt.token.here');
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                email: mockUser.email,
                sub: mockUser.id_usuario,
                role: mockUser.rol,
            });
            expect(mockSystemLogsService.create).toHaveBeenCalledWith({
                usuario_id: mockUser.id_usuario,
                accion: 'LOGIN',
                detalles: { email: mockUser.email, role: mockUser.rol },
            });
        });

        it('debería lanzar UnauthorizedException para credenciales inválidas', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Credenciales inválidas');
        });

        it('debería devolver token incluso si la creación del log falla', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('jwt.token.here');
            mockSystemLogsService.create.mockRejectedValue(new Error('Log error'));

            const result = await service.login(loginDto);

            expect(result).toHaveProperty('access_token');
        });
    });

    describe('register', () => {
        it('debería registrar un nuevo usuario con el rol cliente por defecto', async () => {
            const registerDto: RegisterDto = {
                nombre: 'New User',
                email: 'newuser@example.com',
                telefono: '0999999999',
                password: 'password123',
            };

            mockUsersService.create.mockResolvedValue({ ...mockUser, ...registerDto, rol: 'cliente' });

            const result = await service.register(registerDto);

            expect(mockUsersService.create).toHaveBeenCalledWith({
                nombre: registerDto.nombre,
                email: registerDto.email,
                telefono: registerDto.telefono,
                password: registerDto.password,
                rol: 'cliente',
            });
            expect(result.rol).toBe('cliente');
        });

        it('debería registrar un admin con un codigo secreto válido', async () => {
            const registerDto: RegisterDto = {
                nombre: 'Admin User',
                email: 'admin@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'admin',
                codigo_secreto: 'SECRET123',
            };

            mockUsersService.create.mockResolvedValue({ ...mockUser, ...registerDto, rol: 'admin' });

            const result = await service.register(registerDto);

            expect(mockUsersService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    rol: 'admin',
                }),
            );
            expect(result.rol).toBe('admin');
        });

        it('debería lanzar ForbiddenException con un codigo secreto inválido para el rol solicitado', async () => {
            const registerDto: RegisterDto = {
                nombre: 'Admin User',
                email: 'admin@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'admin',
                codigo_secreto: 'WRONG_CODE',
            };

            await expect(service.register(registerDto)).rejects.toThrow(ForbiddenException);
            await expect(service.register(registerDto)).rejects.toThrow(
                'Código secreto inválido para el rol solicitado',
            );
        });

        it('debería registrar un empleado con un codigo secreto válido', async () => {
            const registerDto: RegisterDto = {
                nombre: 'Employee User',
                email: 'employee@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'empleado',
                codigo_secreto: 'SECRET123',
            };

            mockUsersService.create.mockResolvedValue({ ...mockUser, ...registerDto, rol: 'empleado' });

            const result = await service.register(registerDto);

            expect(mockUsersService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    rol: 'empleado',
                }),
            );
        });

        it('debería no incluir codigo_secreto cuando se crea el usuario', async () => {
            const registerDto: RegisterDto = {
                nombre: 'Admin User',
                email: 'admin@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'admin',
                codigo_secreto: 'SECRET123',
            };

            mockUsersService.create.mockResolvedValue({ ...mockUser, ...registerDto, rol: 'admin' });

            await service.register(registerDto);

            expect(mockUsersService.create).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    codigo_secreto: expect.anything(),
                }),
            );
        });
    });
});
