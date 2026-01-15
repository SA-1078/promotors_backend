import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { SuccessResponseDto } from '../../common/dto/response.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';

describe('CommentsController', () => {
    let controller: CommentsController;

    const mockComment = {
        _id: '507f1f77bcf86cd799439011',
        usuario_id: 1,
        motocicleta_id: 1,
        comentario: 'Excelente moto!',
        calificacion: 5,
        fecha: new Date(),
    };

    const mockCommentsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findByMotorcycle: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentsController],
            providers: [{ provide: CommentsService, useValue: mockCommentsService }],
        }).compile();

        controller = module.get<CommentsController>(CommentsController);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('deberia crear un comentario', async () => {
            const dto: CreateCommentDto = {
                usuario_id: 1,
                motocicleta_id: 1,
                comentario: 'Excelente moto!',
                calificacion: 5,
            };

            mockCommentsService.create.mockResolvedValue(mockComment);

            const result = await controller.create(dto);

            expect(mockCommentsService.create).toHaveBeenCalledWith(dto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Comment added successfully');
            expect(result.data).toEqual(mockComment);
        });
    });

    describe('findAll', () => {
        it('deberia retornar todos los comentarios', async () => {
            const mockComments = [mockComment];
            mockCommentsService.findAll.mockResolvedValue(mockComments);

            const result = await controller.findAll();

            expect(mockCommentsService.findAll).toHaveBeenCalled();
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Comments retrieved successfully');
            expect(result.data).toEqual(mockComments);
        });
    });

    describe('findByMotorcycle', () => {
        it('deberia retornar comentarios de una motocicleta', async () => {
            const mockComments = [mockComment];
            mockCommentsService.findByMotorcycle.mockResolvedValue(mockComments);

            const result = await controller.findByMotorcycle(1);

            expect(mockCommentsService.findByMotorcycle).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Motorcycle comments retrieved successfully');
            expect(result.data).toEqual(mockComments);
        });
    });
});
