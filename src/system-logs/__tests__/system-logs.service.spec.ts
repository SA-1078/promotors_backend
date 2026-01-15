import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SystemLogsService } from '../system-logs.service';

describe('SystemLogsService', () => {
    let service: SystemLogsService;

    const mockLog = {
        _id: '507f1f77bcf86cd799439011',
        usuario_id: 1,
        accion: 'LOGIN',
        detalles: { ip: '127.0.0.1' },
        fecha: new Date(),
        save: jest.fn().mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            usuario_id: 1,
            accion: 'LOGIN',
            detalles: { ip: '127.0.0.1' },
            fecha: new Date(),
        }),
    };

    const mockSystemLogModel = function (dto) {
        return {
            ...mockLog,
            ...dto,
            save: jest.fn().mockResolvedValue({ ...mockLog, ...dto }),
        };
    };

    mockSystemLogModel.find = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SystemLogsService,
                { provide: getModelToken('SystemLog'), useValue: mockSystemLogModel },
            ],
        }).compile();

        service = module.get<SystemLogsService>(SystemLogsService);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('deberia crear un log', async () => {
            const result = await service.create({
                usuario_id: 1,
                accion: 'LOGIN',
                detalles: {},
            });

            expect(result).toBeDefined();
        });
    });

    describe('findAll', () => {
        it('deberia retornar logs ordenados', async () => {
            mockSystemLogModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue([mockLog]),
                    }),
                }),
            });

            const result = await service.findAll();

            expect(result).toEqual([mockLog]);
        });
    });

    describe('findByUser', () => {
        it('deberia retornar logs de un usuario', async () => {
            mockSystemLogModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([mockLog]),
            });

            const result = await service.findByUser(1);

            expect(mockSystemLogModel.find).toHaveBeenCalledWith({ usuario_id: 1 });
            expect(result).toEqual([mockLog]);
        });
    });
});
