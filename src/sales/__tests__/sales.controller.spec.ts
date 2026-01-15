import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from '../sales.controller';
import { SalesService } from '../sales.service';
import { SuccessResponseDto } from '../../common/dto/response.dto';

describe('SalesController', () => {
    let controller: SalesController;

    const mockSale = {
        id_venta: 1,
        id_usuario: 1,
        total: 5500,
        metodo_pago: 'tarjeta',
        estado: 'completada',
        fecha_venta: new Date(),
    };

    const mockSalesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SalesController],
            providers: [{ provide: SalesService, useValue: mockSalesService }],
        }).compile();

        controller = module.get<SalesController>(SalesController);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    it('deberia crear una venta', async () => {
        mockSalesService.create.mockResolvedValue(mockSale);
        const result = await controller.create({} as any);
        expect(result).toBeInstanceOf(SuccessResponseDto);
        expect(result.message).toBe('Sale created successfully');
    });

    it('deberia retornar ventas paginadas', async () => {
        const paginatedResult = { items: [mockSale], meta: {} };
        mockSalesService.findAll.mockResolvedValue(paginatedResult);
        const result = await controller.findAll({ page: 1, limit: 10 });
        expect(result.message).toBe('Sales retrieved successfully');
    });

    it('deberia retornar una venta', async () => {
        mockSalesService.findOne.mockResolvedValue(mockSale);
        const result = await controller.findOne(1);
        expect(result.message).toBe('Sale retrieved successfully');
    });

    it('deberia actualizar una venta', async () => {
        mockSalesService.update.mockResolvedValue(mockSale);
        const result = await controller.update(1, {});
        expect(result.message).toBe('Sale updated successfully');
    });

    it('deberia eliminar una venta', async () => {
        mockSalesService.remove.mockResolvedValue(mockSale);
        const result = await controller.remove(1);
        expect(result.message).toBe('Sale deleted successfully');
    });
});
