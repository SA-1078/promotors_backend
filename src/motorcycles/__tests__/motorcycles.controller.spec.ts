import { Test, TestingModule } from '@nestjs/testing';
import { MotorcyclesController } from '../motorcycles.controller';
import { MotorcyclesService } from '../motorcycles.service';
import { ViewHistoryService } from '../../view-history/view-history.service';
import { JwtService } from '@nestjs/jwt';
import { CreateMotorcycleDto } from '../dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';
import { SuccessResponseDto } from '../../common/dto/response.dto';
import { QueryDto } from '../../common/dto/query.dto';

describe('MotorcyclesController', () => {
    let controller: MotorcyclesController;
    let service: MotorcyclesService;
    let viewHistoryService: ViewHistoryService;
    let jwtService: JwtService;

    const mockMotorcycle = {
        id_moto: 1,
        nombre: 'Ninja 400',
        marca: 'Kawasaki',
        modelo: '2024',
        anio: 2024,
        precio: 5500,
        descripcion: 'Deportiva',
        imagen_url: 'https://example.com/ninja.jpg',
        id_categoria: 1,
    };

    const mockMotorcyclesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    const mockViewHistoryService = {
        addView: jest.fn(),
        addSearch: jest.fn(),
    };

    const mockJwtService = {
        decode: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MotorcyclesController],
            providers: [
                {
                    provide: MotorcyclesService,
                    useValue: mockMotorcyclesService,
                },
                {
                    provide: ViewHistoryService,
                    useValue: mockViewHistoryService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        controller = module.get<MotorcyclesController>(MotorcyclesController);
        service = module.get<MotorcyclesService>(MotorcyclesService);
        viewHistoryService = module.get<ViewHistoryService>(ViewHistoryService);
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('deberia crear una nueva moto', async () => {
            const createMotorcycleDto: CreateMotorcycleDto = {
                nombre: 'Ninja 400',
                marca: 'Kawasaki',
                modelo: '2024',
                anio: 2024,
                precio: 5500,
                descripcion: 'Deportiva',
                imagen_url: 'https://example.com/ninja.jpg',
                id_categoria: 1,
            };

            mockMotorcyclesService.create.mockResolvedValue(mockMotorcycle);

            const result = await controller.create(createMotorcycleDto);

            expect(mockMotorcyclesService.create).toHaveBeenCalledWith(createMotorcycleDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Motorcycle created successfully');
            expect(result.data).toEqual(mockMotorcycle);
        });
    });

    describe('findAll', () => {
        it('deberia retornar motos paginadas', async () => {
            const queryDto: QueryDto = { page: 1, limit: 10 };
            const paginatedResult = {
                items: [mockMotorcycle],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            const mockRequest = {
                headers: {},
            } as any;

            mockMotorcyclesService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(queryDto, mockRequest);

            expect(mockMotorcyclesService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Motorcycles retrieved successfully');
            expect(result.data).toEqual(paginatedResult);
        });

        it('deberia logear historial de busqueda cuando el usuario esta autenticado y buscando', async () => {
            const queryDto: QueryDto = { page: 1, limit: 10, search: 'Ninja' };
            const paginatedResult = {
                items: [mockMotorcycle],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            const mockRequest = {
                headers: {
                    authorization: 'Bearer fake.jwt.token',
                },
            } as any;

            mockJwtService.decode.mockReturnValue({ sub: 1 });
            mockMotorcyclesService.findAll.mockResolvedValue(paginatedResult);
            mockViewHistoryService.addSearch.mockResolvedValue({});

            await controller.findAll(queryDto, mockRequest);

            expect(mockViewHistoryService.addSearch).toHaveBeenCalledWith({
                usuario_id: 1,
                termino: 'Ninja',
            });
        });

        it('deberia limitar el tamaño de la pagina a 100', async () => {
            const queryDto: QueryDto = { page: 1, limit: 200 };
            const paginatedResult = {
                items: [mockMotorcycle],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 100,
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            const mockRequest = {
                headers: {},
            } as any;

            mockMotorcyclesService.findAll.mockResolvedValue(paginatedResult);

            await controller.findAll(queryDto, mockRequest);

            expect(queryDto.limit).toBe(100);
        });
    });

    describe('findOne', () => {
        it('deberia retornar una sola moto', async () => {
            const mockRequest = {
                headers: {},
            } as any;

            mockMotorcyclesService.findOne.mockResolvedValue(mockMotorcycle);

            const result = await controller.findOne(1, mockRequest);

            expect(mockMotorcyclesService.findOne).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Motorcycle retrieved successfully');
            expect(result.data).toEqual(mockMotorcycle);
        });

        it('deberia logear historial de vista cuando el usuario esta autenticado', async () => {
            const mockRequest = {
                headers: {
                    authorization: 'Bearer fake.jwt.token',
                },
            } as any;

            mockJwtService.decode.mockReturnValue({ sub: 1 });
            mockMotorcyclesService.findOne.mockResolvedValue(mockMotorcycle);
            mockViewHistoryService.addView.mockResolvedValue({});

            await controller.findOne(1, mockRequest);

            expect(mockViewHistoryService.addView).toHaveBeenCalledWith({
                usuario_id: 1,
                motocicleta_id: 1,
            });
        });
    });

    describe('update', () => {
        it('deberia actualizar una moto', async () => {
            const updateMotorcycleDto: UpdateMotorcycleDto = {
                precio: 6000,
            };

            const updatedMotorcycle = { ...mockMotorcycle, precio: 6000 };
            mockMotorcyclesService.update.mockResolvedValue(updatedMotorcycle);

            const result = await controller.update(1, updateMotorcycleDto);

            expect(mockMotorcyclesService.update).toHaveBeenCalledWith(1, updateMotorcycleDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Motorcycle updated successfully');
            expect(result.data.precio).toBe(6000);
        });
    });

    describe('remove', () => {
        it('deberia eliminar una moto', async () => {
            mockMotorcyclesService.remove.mockResolvedValue(mockMotorcycle);

            const result = await controller.remove(1);

            expect(mockMotorcyclesService.remove).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Motorcycle deleted successfully');
            expect(result.data).toEqual(mockMotorcycle);
        });
    });
});
