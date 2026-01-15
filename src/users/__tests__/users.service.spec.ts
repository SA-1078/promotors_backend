import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

    const mockUser: User = {
        id_usuario: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        telefono: '0999999999',
        password_hash: 'hashedPassword123',
        rol: 'cliente',
        fecha_registro: new Date(),
    };

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));

        jest.clearAllMocks();
    });

    it('debería estar correctamente definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('debería crear un nuevo usuario correctamente', async () => {
            const createUserDto: CreateUserDto = {
                nombre: 'Test User',
                email: 'test@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'cliente',
            };

            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);

            const result = await service.create(createUserDto);

            expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
            expect(mockRepository.create).toHaveBeenCalledWith({
                nombre: createUserDto.nombre,
                email: createUserDto.email,
                telefono: createUserDto.telefono,
                rol: createUserDto.rol,
                password_hash: 'hashedPassword123',
            });
            expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(mockUser);
        });

        it('debería lanzar InternalServerErrorException en caso de error', async () => {
            const createUserDto: CreateUserDto = {
                nombre: 'Test User',
                email: 'test@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'cliente',
            };

            (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

            await expect(service.create(createUserDto)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findOne', () => {
        it('debería devolver un usuario por ID', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id_usuario: 1 },
            });
            expect(result).toEqual(mockUser);
        });

        it('debería lanzar NotFoundException si el usuario no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow(
                'User with ID 999 not found',
            );
        });

        it('debería lanzar InternalServerErrorException en caso de error en la base de datos', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));

            await expect(service.findOne(1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findByEmail', () => {
        it('debería devolver un usuario por correo electrónico', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findByEmail('test@example.com');

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(result).toEqual(mockUser);
        });

        it('debería devolver null si el usuario no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.findByEmail('notfound@example.com');

            expect(result).toBeNull();
        });

        it('debería lanzar InternalServerErrorException en caso de error en la base de datos', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));

            await expect(service.findByEmail('test@example.com')).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('update', () => {
        it('debería actualizar un usuario correctamente', async () => {
            const updateUserDto: UpdateUserDto = {
                nombre: 'Updated Name',
            };

            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockResolvedValue({ ...mockUser, ...updateUserDto });

            const result = await service.update(1, updateUserDto);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id_usuario: 1 },
            });
            expect(mockRepository.save).toHaveBeenCalled();
            expect(result.nombre).toBe('Updated Name');
        });

        it('debería hashear la contraseña al actualizar', async () => {
            const updateUserDto: UpdateUserDto = {
                password: 'newPassword123',
            };

            (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);

            await service.update(1, updateUserDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
        });

        it('debería lanzar NotFoundException si el usuario no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
        });

        it('debería lanzar InternalServerErrorException en caso de error en la base de datos', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));

            await expect(service.update(1, {})).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('remove', () => {
        it('debería eliminar un usuario correctamente', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.remove.mockResolvedValue(mockUser);

            const result = await service.remove(1);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(mockUser);
        });

        it('debería lanzar NotFoundException si el usuario no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
