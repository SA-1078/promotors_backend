import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from '../carts.controller';
import { CartsService } from '../carts.service';
import { SuccessResponseDto } from '../../common/dto/response.dto';
import { CreateCartDto } from '../dto/create-cart.dto';

describe('CartsController', () => {
    let controller: CartsController;

    const mockCart = {
        _id: '507f1f77bcf86cd799439011',
        usuario_id: 1,
        items: [{ motocicleta_id: 1, cantidad: 2, precio_unitario: 5500, subtotal: 11000 }],
    };

    const mockCartsService = {
        createOrUpdate: jest.fn(),
        findByUser: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CartsController],
            providers: [{ provide: CartsService, useValue: mockCartsService }],
        }).compile();

        controller = module.get<CartsController>(CartsController);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('updateCart', () => {
        it('deberia crear o actualizar el carrito', async () => {
            const dto: CreateCartDto = {
                usuario_id: 1,
                items: [{ motocicleta_id: 1, cantidad: 2, precio_unitario: 0, subtotal: 0 }],
            };

            mockCartsService.createOrUpdate.mockResolvedValue(mockCart);

            const result = await controller.updateCart(dto);

            expect(mockCartsService.createOrUpdate).toHaveBeenCalledWith(dto);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Cart updated successfully');
            expect(result.data).toEqual(mockCart);
        });
    });

    describe('findByUser', () => {
        it('deberia retornar el carrito de un usuario', async () => {
            mockCartsService.findByUser.mockResolvedValue(mockCart);

            const result = await controller.findByUser(1);

            expect(mockCartsService.findByUser).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Cart retrieved successfully');
            expect(result.data).toEqual(mockCart);
        });

        it('deberia retornar carrito vacio si no existe', async () => {
            mockCartsService.findByUser.mockResolvedValue(null);

            const result = await controller.findByUser(1);

            expect(result.data).toEqual({ items: [] });
        });
    });

    describe('delete', () => {
        it('deberia eliminar el carrito de un usuario', async () => {
            mockCartsService.delete.mockResolvedValue({ deletedCount: 1 });

            const result = await controller.delete(1);

            expect(mockCartsService.delete).toHaveBeenCalledWith(1);
            expect(result).toBeInstanceOf(SuccessResponseDto);
            expect(result.message).toBe('Cart cleared successfully');
            expect(result.data).toBeNull();
        });
    });
});
