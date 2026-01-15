import { Test, TestingModule } from '@nestjs/testing';
import { SystemLogsController } from '../system-logs.controller';
import { SystemLogsService } from '../system-logs.service';
import { SuccessResponseDto } from '../../common/dto/response.dto';

describe('SystemLogsController', () => {
    let controller: SystemLogsController;

    const mockLog = {
        _id: '507f1f77bcf86cd799439011',
        usuario_id: 1,
        accion: 'LOGIN',
        detalles: {},
        fecha: new Date(),
    };

    const mockSystemLogsService = {
        findAll: jest.fn(),
        findByUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SystemLogsController],
            providers: [{ provide: SystemLogsService, useValue: mockSystemLogsService }],
        }).compile();

        controller = module.get<SystemLogsController>(SystemLogsController);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    it('deberia retornar todos los logs', async () => {
        mockSystemLogsService.findAll.mockResolvedValue([mockLog]);
        const result = await controller.findAll();
        expect(result).toBeInstanceOf(SuccessResponseDto);
        expect(result.message).toBe('Logs retrieved successfully');
    });

    it('deberia retornar logs de un usuario', async () => {
        mockSystemLogsService.findByUser.mockResolvedValue([mockLog]);
        const result = await controller.findByUser(1);
        expect(result.message).toBe('User logs retrieved successfully');
    });
});
