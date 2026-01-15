import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryService } from '../inventory.service';
import { Inventory } from '../inventory.entity';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';


jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(),
}));

import { paginate } from 'nestjs-typeorm-paginate';

describe('InventoryService', () => {
    let service: InventoryService;
    let repository: Repository<Inventory>;

    const mockInventory: Inventory = {
        id_inventario: 1,
        id_moto: 1,
        stock_actual: 10,
        ubicacion: 'Warehouse A',
        ultima_actualizacion: new Date(),
        motorcycle: {
            id_moto: 1,
            nombre: 'Ninja 400',
            marca: 'Kawasaki',
            modelo: '2024',
            anio: 2024,
            precio: 5500,
            descripcion: 'Deportiva',
            id_categoria: 1,
            imagen_url: 'test.jpg',
            categoria: {
                id_categoria: 1,
                nombre: 'Deportivas',
                descripcion: 'Motos deportivas',
            },
        },
    };

    const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
    };

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                {
                    provide: getRepositoryToken(Inventory),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
        repository = module.get<Repository<Inventory>>(getRepositoryToken(Inventory));

        jest.clearAllMocks();
    });

    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('debe crear un inventario', async () => {
            const dto: CreateInventoryDto = {
                id_moto: 1,
                stock_actual: 10,
                ubicacion: 'Warehouse A',
            };

            mockRepository.create.mockReturnValue(mockInventory);
            mockRepository.save.mockResolvedValue(mockInventory);

            const result = await service.create(dto);

            expect(mockRepository.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockInventory);
        });

        it('debe lanzar InternalServerErrorException en error', async () => {
            mockRepository.create.mockImplementation(() => {
                throw new Error('DB error');
            });

            await expect(service.create({} as any)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findAll', () => {
        it('debe devolver inventario paginado', async () => {
            const paginatedResult = {
                items: [mockInventory],
                meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
            };

            (paginate as jest.Mock).mockResolvedValue(paginatedResult);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('inventory');
            expect(result).toEqual(paginatedResult);
        });
    });

    describe('findOne', () => {
        it('deberia devolver un inventario', async () => {
            mockRepository.findOne.mockResolvedValue(mockInventory);

            const result = await service.findOne(1);

            expect(result).toEqual(mockInventory);
        });

        it('deberia lanzar NotFoundException si no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('deberia actualizar un inventario', async () => {
            const dto: UpdateInventoryDto = { stock_actual: 15 };

            mockRepository.findOne.mockResolvedValue(mockInventory);
            mockRepository.save.mockResolvedValue({ ...mockInventory, ...dto });

            const result = await service.update(1, dto);

            expect(result.stock_actual).toBe(15);
        });
    });

    describe('remove', () => {
        it('deberia eliminar un inventario', async () => {
            mockRepository.findOne.mockResolvedValue(mockInventory);
            mockRepository.remove.mockResolvedValue(mockInventory);

            const result = await service.remove(1);

            expect(result).toEqual(mockInventory);
        });
    });

    describe('reduceStock', () => {
        it('deberia reducir el stock correctamente', async () => {
            mockRepository.findOne.mockResolvedValue(mockInventory);
            mockRepository.save.mockResolvedValue({ ...mockInventory, stock_actual: 5 });

            await service.reduceStock(1, 5);

            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('deberia lanzar BadRequestException si el stock es insuficiente', async () => {
            mockRepository.findOne.mockResolvedValue(mockInventory);

            await expect(service.reduceStock(1, 20)).rejects.toThrow(BadRequestException);
        });

        it('deberia lanzar NotFoundException si el inventario no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.reduceStock(999, 1)).rejects.toThrow(NotFoundException);
        });
    });
});
