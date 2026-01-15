import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ViewHistoryService } from '../view-history.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('ViewHistoryService', () => {
    let service: ViewHistoryService;

    const mockViewHistory = {
        _id: '507f1f77bcf86cd799439011',
        usuario_id: 1,
        visto: [{ motocicleta_id: 1, fecha: new Date() }],
        busquedas: [{ termino: 'kawasaki', fecha: new Date() }],
    };

    const mockViewHistoryModel = {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ViewHistoryService,
                { provide: getModelToken('ViewHistory'), useValue: mockViewHistoryModel },
            ],
        }).compile();

        service = module.get<ViewHistoryService>(ViewHistoryService);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('addView', () => {
        it('deberia agregar una vista al historial', async () => {
            mockViewHistoryModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockViewHistory),
            });

            const result = await service.addView({ usuario_id: 1, motocicleta_id: 1 });

            expect(mockViewHistoryModel.findOneAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockViewHistory);
        });

        it('deberia lanzar InternalServerErrorException en caso de error', async () => {
            mockViewHistoryModel.findOneAndUpdate.mockImplementation(() => {
                throw new Error('DB error');
            });

            await expect(service.addView({ usuario_id: 1, motocicleta_id: 1 }))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('addSearch', () => {
        it('deberia agregar una busqueda al historial', async () => {
            mockViewHistoryModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockViewHistory),
            });

            const result = await service.addSearch({ usuario_id: 1, termino: 'kawasaki' });

            expect(mockViewHistoryModel.findOneAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockViewHistory);
        });

        it('deberia lanzar InternalServerErrorException en caso de error', async () => {
            mockViewHistoryModel.findOneAndUpdate.mockImplementation(() => {
                throw new Error('DB error');
            });

            await expect(service.addSearch({ usuario_id: 1, termino: 'test' }))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('findByUser', () => {
        it('deberia retornar el historial de un usuario', async () => {
            mockViewHistoryModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockViewHistory),
            });

            const result = await service.findByUser(1);

            expect(mockViewHistoryModel.findOne).toHaveBeenCalledWith({ usuario_id: 1 });
            expect(result).toEqual(mockViewHistory);
        });

        it('deberia lanzar InternalServerErrorException en caso de error', async () => {
            mockViewHistoryModel.findOne.mockImplementation(() => {
                throw new Error('DB error');
            });

            await expect(service.findByUser(1)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
