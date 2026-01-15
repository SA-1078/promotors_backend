import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotorcyclesService } from '../motorcycles.service';
import { Motorcycle } from '../motorcycle.entity';
import { CreateMotorcycleDto } from '../dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from '../dto/update-motorcycle.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';


jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(),
}));

import { paginate } from 'nestjs-typeorm-paginate';

describe('MotorcyclesService', () => {
    let service: MotorcyclesService;
    let repository: Repository<Motorcycle>;

    const mockMotorcycle: Motorcycle = {
        id_moto: 1,
        nombre: 'Ninja 400',
        marca: 'Kawasaki',
        modelo: '2024',
        anio: 2024,
        precio: 5500,
        descripcion: 'Deportiva',
        imagen_url: 'https://example.com/ninja.jpg',
        id_categoria: 1,
        categoria: {
            id_categoria: 1,
            nombre: 'Deportivas',
            descripcion: 'Motos deportivas',
        },
    };

    const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
    };

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MotorcyclesService,
                {
                    provide: getRepositoryToken(Motorcycle),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<MotorcyclesService>(MotorcyclesService);
        repository = module.get<Repository<Motorcycle>>(getRepositoryToken(Motorcycle));

        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('deberia crear exitosamente una moto', async () => {
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

            mockRepository.create.mockReturnValue(mockMotorcycle);
            mockRepository.save.mockResolvedValue(mockMotorcycle);

            const result = await service.create(createMotorcycleDto);

            expect(mockRepository.create).toHaveBeenCalledWith(createMotorcycleDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockMotorcycle);
            expect(result).toEqual(mockMotorcycle);
        });

        it('deberia arrojar InternalServerErrorException en error', async () => {
            mockRepository.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(service.create({
                nombre: 'Test',
                marca: 'Test',
                modelo: '2024',
                anio: 2024,
                precio: 1000,
                descripcion: 'Test',
                imagen_url: 'test.jpg',
                id_categoria: 1,
            })).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findAll', () => {
        it('deberia retornar motos paginadas', async () => {
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

            (paginate as jest.Mock).mockResolvedValue(paginatedResult);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('motorcycle');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('motorcycle.categoria', 'category');
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('motorcycle.id_moto', 'DESC');
            expect(paginate).toHaveBeenCalled();
            expect(result).toEqual(paginatedResult);
        });

        it('deberia aplicar filtro de busqueda cuando se proporciona', async () => {
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

            (paginate as jest.Mock).mockResolvedValue(paginatedResult);

            await service.findAll({ page: 1, limit: 10, search: 'Ninja' });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                '(motorcycle.nombre ILIKE :search OR motorcycle.marca ILIKE :search OR motorcycle.modelo ILIKE :search)',
                { search: '%Ninja%' },
            );
        });
    });

    describe('findOne', () => {
        it('deberia retornar una moto por ID con relaciones', async () => {
            mockRepository.findOne.mockResolvedValue(mockMotorcycle);

            const result = await service.findOne(1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id_moto: 1 },
                relations: ['categoria'],
            });
            expect(result).toEqual(mockMotorcycle);
        });

        it('deberia arrojar NotFoundException si moto no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow('Motorcycle with ID 999 not found');
        });

        it('deberia arrojar InternalServerErrorException en error de base de datos', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));

            await expect(service.findOne(1)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        it('deberia actualizar exitosamente una moto', async () => {
            const updateMotorcycleDto: UpdateMotorcycleDto = {
                precio: 6000,
            };

            mockRepository.findOne.mockResolvedValue(mockMotorcycle);
            mockRepository.save.mockResolvedValue({
                ...mockMotorcycle,
                ...updateMotorcycleDto,
            });

            const result = await service.update(1, updateMotorcycleDto);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id_moto: 1 },
                relations: ['categoria'],
            });
            expect(mockRepository.save).toHaveBeenCalled();
            expect(result.precio).toBe(6000);
        });

        it('deberia arrojar NotFoundException si moto no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('deberia eliminar exitosamente una moto', async () => {
            mockRepository.findOne.mockResolvedValue(mockMotorcycle);
            mockRepository.remove.mockResolvedValue(mockMotorcycle);

            const result = await service.remove(1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id_moto: 1 },
                relations: ['categoria'],
            });
            expect(mockRepository.remove).toHaveBeenCalledWith(mockMotorcycle);
            expect(result).toEqual(mockMotorcycle);
        });

        it('deberia arrojar NotFoundException si moto no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
