import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SalesService } from '../sales.service';
import { Sale } from '../sale.entity';
import { SaleDetail } from '../sale-detail.entity';
import { SystemLogsService } from '../../system-logs/system-logs.service';
import { InventoryService } from '../../inventory/inventory.service';


jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(),
}));

import { paginate } from 'nestjs-typeorm-paginate';

describe('SalesService', () => {
    let service: SalesService;

    const mockSale = {
        id_venta: 1,
        id_usuario: 1,
        total: 5500,
        metodo_pago: 'tarjeta',
        estado: 'completada',
        fecha_venta: new Date(),
    };

    const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
            create: jest.fn(),
            save: jest.fn(),
        },
    };

    const mockDataSource = {
        createQueryRunner: jest.fn(() => mockQueryRunner),
    };

    const mockSaleRepository = {
        createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
        })),
        findOne: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    };

    const mockSaleDetailRepository = {};

    const mockSystemLogsService = {
        create: jest.fn().mockResolvedValue({}),
    };

    const mockInventoryService = {
        reduceStock: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesService,
                { provide: getRepositoryToken(Sale), useValue: mockSaleRepository },
                { provide: getRepositoryToken(SaleDetail), useValue: mockSaleDetailRepository },
                { provide: DataSource, useValue: mockDataSource },
                { provide: SystemLogsService, useValue: mockSystemLogsService },
                { provide: InventoryService, useValue: mockInventoryService },
            ],
        }).compile();

        service = module.get<SalesService>(SalesService);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('deberia crear una venta con transaccion', async () => {
            const dto = {
                id_usuario: 1,
                total: 5500,
                metodo_pago: 'tarjeta',
                estado: 'completada',
                detalles: [{ id_moto: 1, cantidad: 1, precio_unitario: 5500, subtotal: 5500 }],
            };

            mockQueryRunner.manager.create.mockReturnValue(mockSale);
            mockQueryRunner.manager.save.mockResolvedValue(mockSale);

            const result = await service.create(dto);

            expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('deberia retornar ventas paginadas', async () => {
            const paginatedResult = {
                items: [mockSale],
                meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
            };

            (paginate as jest.Mock).mockResolvedValue(paginatedResult);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result).toEqual(paginatedResult);
        });
    });

    describe('findOne', () => {
        it('deberia retornar una venta', async () => {
            mockSaleRepository.findOne.mockResolvedValue(mockSale);

            const result = await service.findOne(1);

            expect(result).toEqual(mockSale);
        });
    });

    describe('update', () => {
        it('deberia actualizar una venta', async () => {
            mockSaleRepository.findOne.mockResolvedValue(mockSale);
            mockSaleRepository.save.mockResolvedValue(mockSale);

            const result = await service.update(1, { estado: 'cancelada' });

            expect(result).toBeDefined();
        });
    });

    describe('remove', () => {
        it('deberia eliminar una venta', async () => {
            mockSaleRepository.findOne.mockResolvedValue(mockSale);
            mockSaleRepository.remove.mockResolvedValue(mockSale);

            const result = await service.remove(1);

            expect(result).toEqual(mockSale);
        });
    });
});
