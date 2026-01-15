import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CommentsService } from '../comments.service';

describe('CommentsService', () => {
    let service: CommentsService;

    const mockCommentDoc = {
        _id: '507f1f77bcf86cd799439011',
        usuario_id: 1,
        motocicleta_id: 1,
        comentario: 'Excelente moto!',
        calificacion: 5,
        fecha: new Date(),
        save: jest.fn().mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            usuario_id: 1,
            motocicleta_id: 1,
            comentario: 'Excelente moto!',
            calificacion: 5,
            fecha: new Date(),
        }),
    };

    const mockCommentModel = function (dto) {
        return {
            ...mockCommentDoc,
            ...dto,
            save: jest.fn().mockResolvedValue({ ...mockCommentDoc, ...dto }),
        };
    };

    mockCommentModel.find = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                { provide: getModelToken('Comment'), useValue: mockCommentModel },
            ],
        }).compile();

        service = module.get<CommentsService>(CommentsService);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('deberia crear un comentario', async () => {
            const dto = {
                usuario_id: 1,
                motocicleta_id: 1,
                comentario: 'Excelente moto!',
                calificacion: 5,
            };

            const result = await service.create(dto);

            expect(result).toBeDefined();
        });
    });

    describe('findAll', () => {
        it('deberia retornar todos los comentarios ordenados', async () => {
            const mockComments = [mockCommentDoc];

            mockCommentModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(mockComments),
                    }),
                }),
            });

            const result = await service.findAll();

            expect(mockCommentModel.find).toHaveBeenCalled();
            expect(result).toEqual(mockComments);
        });

        it('deberia limitar a 100 comentarios', async () => {
            const limitSpy = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });

            mockCommentModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: limitSpy,
                }),
            });

            await service.findAll();

            expect(limitSpy).toHaveBeenCalledWith(100);
        });
    });

    describe('findByMotorcycle', () => {
        it('deberia retornar comentarios de una motocicleta especifica', async () => {
            const mockComments = [mockCommentDoc];

            mockCommentModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockComments),
                }),
            });

            const result = await service.findByMotorcycle(1);

            expect(mockCommentModel.find).toHaveBeenCalledWith({ motocicleta_id: 1 });
            expect(result).toEqual(mockComments);
        });

        it('deberia ordenar por fecha descendente', async () => {
            const sortSpy = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });

            mockCommentModel.find.mockReturnValue({ sort: sortSpy });

            await service.findByMotorcycle(1);

            expect(sortSpy).toHaveBeenCalledWith({ fecha: -1 });
        });
    });
});
