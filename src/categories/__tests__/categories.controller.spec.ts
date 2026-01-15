import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { SuccessResponseDto } from '../../common/dto/response.dto';
import { QueryDto } from '../../common/dto/query.dto';

describe('CategoriesController', () => {
    let controller: CategoriesController;
    let service: CategoriesService;

    const mockCategory = {
        id_categoria: 1,
        nombre: 'Deportivas',
        descripcion: 'Motocicletas deportivas',
    };

    const mockCategoriesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [
                {
                    provide: CategoriesService,
                    useValue: mockCategoriesService,
                },
            ],
        }).compile();

        controller = module.get<CategoriesController>(CategoriesController);
        service = module.get<CategoriesService>(CategoriesService);

        jest.clearAllMocks();
    });

    it('debería estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('debería crear una nueva categoría', async () => {
            const createCategoryDto: CreateCategoryDto = {
                nombre: 'Deportivas',
                descripcion: 'Motocicletas deportivas',
            };

            mockCategoriesService.create.mockResolvedValue(mockCategory);

            const result = await controller.create(createCategoryDto);

            expect(mockCategoriesService.create).toHaveBeenCalledWith(createCategoryDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Category created successfully');
            expect(result.data).toEqual(mockCategory);
        });
    });

    describe('findAll', () => {
        it('debería devolver categorías paginadas', async () => {
            const queryDto: QueryDto = { page: 1, limit: 10 };
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

            mockCategoriesService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(queryDto);

            expect(mockCategoriesService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Categories retrieved successfully');
            expect(result.data).toEqual(paginatedResult);
        });
    });

    describe('findOne', () => {
        it('debería devolver una sola categoría', async () => {
            mockCategoriesService.findOne.mockResolvedValue(mockCategory);

            const result = await controller.findOne(1);

            expect(mockCategoriesService.findOne).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Category retrieved successfully');
            expect(result.data).toEqual(mockCategory);
        });
    });

    describe('update', () => {
        it('debería actualizar una categoría', async () => {
            const updateCategoryDto: UpdateCategoryDto = {
                nombre: 'Deportivas Actualizadas',
            };

            const updatedCategory = { ...mockCategory, ...updateCategoryDto };
            mockCategoriesService.update.mockResolvedValue(updatedCategory);

            const result = await controller.update(1, updateCategoryDto);

            expect(mockCategoriesService.update).toHaveBeenCalledWith(1, updateCategoryDto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Category updated successfully');
            expect(result.data).toEqual(updatedCategory);
        });
    });

    describe('remove', () => {
        it('debería eliminar una categoría', async () => {
            mockCategoriesService.remove.mockResolvedValue(mockCategory);

            const result = await controller.remove(1);

            expect(mockCategoriesService.remove).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Category deleted successfully');
            expect(result.data).toEqual(mockCategory);
        });
    });
});
