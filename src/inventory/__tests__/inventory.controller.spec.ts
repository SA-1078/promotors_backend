import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from '../inventory.controller';
import { InventoryService } from '../inventory.service';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { SuccessResponseDto } from '../../common/dto/response.dto';

describe('InventoryController', () => {
    let controller: InventoryController;

    const mockInventory = {
        id_inventario: 1,
        id_moto: 1,
        stock_actual: 10,
        ubicacion: 'Warehouse A',
        ultima_actualizacion: new Date(),
    };

    const mockInventoryService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InventoryController],
            providers: [{ provide: InventoryService, useValue: mockInventoryService }],
        }).compile();

        controller = module.get<InventoryController>(InventoryController);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('deberia crear un inventario', async () => {
            const dto: CreateInventoryDto = { id_moto: 1, stock_actual: 10, ubicacion: 'Warehouse A' };
            mockInventoryService.create.mockResolvedValue(mockInventory);

            const result = await controller.create(dto);

            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Inventory item created successfully');
        });
    });

    describe('findAll', () => {
        it('deberia retornar inventario paginado', async () => {
            const paginatedResult = {
                items: [mockInventory],
                meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
            };
            mockInventoryService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll({ page: 1, limit: 10 });

            expect(result.message).toBe('Inventory items retrieved successfully');
        });
    });

    describe('findOne', () => {
        it('deberia retornar un inventario', async () => {
            mockInventoryService.findOne.mockResolvedValue(mockInventory);

            const result = await controller.findOne(1);

            expect(result.message).toBe('Inventory item retrieved successfully');
        });
    });

    describe('update', () => {
        it('deberia actualizar un inventario', async () => {
            const dto: UpdateInventoryDto = { stock_actual: 15 };
            mockInventoryService.update.mockResolvedValue({ ...mockInventory, ...dto });

            const result = await controller.update(1, dto);

            expect(result.message).toBe('Inventory item updated successfully');
        });
    });

    describe('remove', () => {
        it('deberia eliminar un inventario', async () => {
            mockInventoryService.remove.mockResolvedValue(mockInventory);

            const result = await controller.remove(1);

            expect(result.message).toBe('Inventory item deleted successfully');
        });
    });
});
