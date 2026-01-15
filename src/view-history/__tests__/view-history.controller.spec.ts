import { Test, TestingModule } from '@nestjs/testing';
import { ViewHistoryController } from '../view-history.controller';
import { ViewHistoryService } from '../view-history.service';
import { SuccessResponseDto } from '../../common/dto/response.dto';

describe('ViewHistoryController', () => {
    let controller: ViewHistoryController;

    const mockHistory = {
        _id: '507f1f77bcf86cd799439011',
        usuario_id: 1,
        visto: [],
        busquedas: [],
    };

    const mockViewHistoryService = {
        findByUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ViewHistoryController],
            providers: [{ provide: ViewHistoryService, useValue: mockViewHistoryService }],
        }).compile();

        controller = module.get<ViewHistoryController>(ViewHistoryController);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    it('deberia retornar el historial de un usuario', async () => {
        mockViewHistoryService.findByUser.mockResolvedValue(mockHistory);
        const result = await controller.findByUser(1);
        expect(result).toBeInstanceOf(SuccessResponseDto);
        expect(result.message).toBe('View history retrieved successfully');
    });

    it('deberia retornar historial vacio si no existe', async () => {
        mockViewHistoryService.findByUser.mockResolvedValue(null);
        const result = await controller.findByUser(1);
        expect(result.data).toEqual({ usuario_id: 1, visto: [], busquedas: [] });
    });
});
