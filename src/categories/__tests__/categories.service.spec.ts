import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories.service';
import { Category } from '../category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';


jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(),
}));

import { paginate } from 'nestjs-typeorm-paginate';

describe('CategoriesService', () => {
    let service: CategoriesService;
    let repository: Repository<Category>;

    const mockCategory: Category = {
        id_categoria: 1,
        nombre: 'Deportivas',
        descripcion: 'Motocicletas deportivas',
    };

    const mockQueryBuilder: any = {
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
                CategoriesService,
                {
                    provide: getRepositoryToken(Category),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<CategoriesService>(CategoriesService);
        repository = module.get<Repository<Category>>(getRepositoryToken(Category));

        jest.clearAllMocks();
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('debería crear exitosamente una categoría', async () => {
            const createCategoryDto: CreateCategoryDto = {
                nombre: 'Deportivas',
                descripcion: 'Motocicletas deportivas',
            };

            mockRepository.create.mockReturnValue(mockCategory);
            mockRepository.save.mockResolvedValue(mockCategory);

            const result = await service.create(createCategoryDto);

            expect(mockRepository.create).toHaveBeenCalledWith(createCategoryDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockCategory);
            expect(result).toEqual(mockCategory);
        });

        it('debería lanzar InternalServerErrorException en caso de error', async () => {
            mockRepository.create.mockImplementation(() => {
                throw new Error('Database error');
            });

            await expect(service.create({ nombre: 'Test', descripcion: 'Test' })).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('findAll', () => {
        it('debería devolver categorías paginadas', async () => {
            const paginatedResult = {
                items: [mockCategory],
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

            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('category');
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('category.id_categoria', 'ASC');
            expect(paginate).toHaveBeenCalled();
            expect(result).toEqual(paginatedResult);
        });

        it('debería aplicar el filtro de búsqueda cuando se proporciona', async () => {
            const paginatedResult = {
                items: [mockCategory],
                meta: {
                    totalItems: 1,
                    itemCount: 1,
                    itemsPerPage: 10,
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            (paginate as jest.Mock).mockResolvedValue(paginatedResult);

            await service.findAll({ page: 1, limit: 10, search: 'Deportivas' });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                'category.nombre ILIKE :search',
                { search: '%Deportivas%' },
            );
        });
    });

    describe('findOne', () => {
        it('debería devolver una categoría por ID', async () => {
            mockRepository.findOne.mockResolvedValue(mockCategory);

            const result = await service.findOne(1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id_categoria: 1 },
            });
            expect(result).toEqual(mockCategory);
        });

        it('debería lanzar NotFoundException si la categoría no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });

        it('debería lanzar InternalServerErrorException en caso de error en la base de datos', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));

            await expect(service.findOne(1)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('update', () => {
        it('debería actualizar exitosamente una categoría', async () => {
            const updateCategoryDto: UpdateCategoryDto = {
                nombre: 'Deportivas Actualizadas',
            };

            mockRepository.findOne.mockResolvedValue(mockCategory);
            mockRepository.save.mockResolvedValue({
                ...mockCategory,
                ...updateCategoryDto,
            });

            const result = await service.update(1, updateCategoryDto);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id_categoria: 1 },
            });
            expect(mockRepository.save).toHaveBeenCalled();
            expect(result.nombre).toBe('Deportivas Actualizadas');
        });

        it('debería lanzar NotFoundException si la categoría no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('debería eliminar exitosamente una categoría', async () => {
            mockRepository.findOne.mockResolvedValue(mockCategory);
            mockRepository.remove.mockResolvedValue(mockCategory);

            const result = await service.remove(1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id_categoria: 1 },
            });
            expect(mockRepository.remove).toHaveBeenCalledWith(mockCategory);
            expect(result).toEqual(mockCategory);
        });

        it('debería lanzar NotFoundException si la categoría no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});
