import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../user.entity';
import { SuccessResponseDto } from '../../common/dto/response.dto';
import { QueryDto } from '../../common/dto/query.dto';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUser: User = {
        id_usuario: 1,
        nombre: 'Test User',
        email: 'test@example.com',
        telefono: '0999999999',
        password_hash: 'hashedPassword123',
        rol: 'cliente',
        fecha_registro: new Date(),
    };

    const mockUsersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);

        jest.clearAllMocks();
    });

    it('debería estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('debería crear un nuevo usuario', async () => {
            const createUserDto: CreateUserDto = {
                nombre: 'Test User',
                email: 'test@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'cliente',
            };

            mockUsersService.create.mockResolvedValue(mockUser);

            const result = await controller.create(createUserDto);

            expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('User created successfully');
            expect(result.data).toEqual(mockUser);
        });

        it('debería lanzar error si el servicio falla', async () => {
            const createUserDto: CreateUserDto = {
                nombre: 'Test User',
                email: 'test@example.com',
                telefono: '0999999999',
                password: 'password123',
                rol: 'cliente',
            };

            mockUsersService.create.mockRejectedValue(new Error('Creacion fallida'));

            await expect(controller.create(createUserDto)).rejects.toThrow();
        });
    });

    describe('findAll', () => {
        it('debería devolver usuarios paginados', async () => {
            const queryDto: QueryDto = {
                page: 1,
                limit: 10,
            };

            const paginatedResult = {
                items: [mockUser],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            mockUsersService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(queryDto);

            expect(mockUsersService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Users retrieved successfully');
            expect(result.data).toEqual(paginatedResult);
        });

        it('debería limitar el tamaño de la página a 100', async () => {
            const queryDto: QueryDto = {
                page: 1,
                limit: 200,
            };

            const paginatedResult = {
                items: [mockUser],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 100,
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            mockUsersService.findAll.mockResolvedValue(paginatedResult);

            await controller.findAll(queryDto);

            expect(queryDto.limit).toBe(100);
        });
    });

    describe('findOne', () => {
        it('debería devolver un solo usuario', async () => {
            mockUsersService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne(1);

            expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('User retrieved successfully');
            expect(result.data).toEqual(mockUser);
        });

        it('debería lanzar error si el usuario no se encuentra', async () => {
            mockUsersService.findOne.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(controller.findOne(999)).rejects.toThrow();
        });
    });

    describe('update', () => {
        it('debería actualizar un usuario', async () => {
            const updateUserDto: UpdateUserDto = {
                nombre: 'Updated Name',
            };

            const updatedUser = { ...mockUser, nombre: 'Updated Name' };
            mockUsersService.update.mockResolvedValue(updatedUser);

            const result = await controller.update(1, updateUserDto);

            expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('User updated successfully');
            expect(result.data.nombre).toBe('Updated Name');
        });

        it('debería lanzar error si el usuario no se encuentra', async () => {
            mockUsersService.update.mockRejectedValue(
                new Error('Usuario no encontrado'),
            );

            await expect(controller.update(999, {})).rejects.toThrow();
        });
    });

    describe('remove', () => {
        it('debería eliminar un usuario', async () => {
            mockUsersService.remove.mockResolvedValue(mockUser);

            const result = await controller.remove(1);

            expect(mockUsersService.remove).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('User deleted successfully');
            expect(result.data).toEqual(mockUser);
        });

        it('debería lanzar error si el usuario no se encuentra', async () => {
            mockUsersService.remove.mockRejectedValue(
                new Error('User not found'),
            );

            await expect(controller.remove(999)).rejects.toThrow();
        });
    });
});
