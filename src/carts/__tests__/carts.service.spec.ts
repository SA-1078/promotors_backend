import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CartsService } from '../carts.service';
import { MotorcyclesService } from '../../motorcycles/motorcycles.service';

describe('CartsService', () => {
    let service: CartsService;

    const mockMotorcyclesService = {
        findOne: jest.fn(),
    };

    const mockCartModel: any = jest.fn().mockImplementation((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011', ...dto }),
    }));

    mockCartModel.findOne = jest.fn();
    mockCartModel.deleteOne = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartsService,
                { provide: getModelToken('Cart'), useValue: mockCartModel },
                { provide: MotorcyclesService, useValue: mockMotorcyclesService },
            ],
        }).compile();

        service = module.get<CartsService>(CartsService);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('createOrUpdate', () => {
        it('deberia crear un carrito nuevo', async () => {
            const dto = {
                usuario_id: 1,
                items: [{ motocicleta_id: 1, cantidad: 2, precio_unitario: 0, subtotal: 0 }],
            };

            mockMotorcyclesService.findOne.mockResolvedValue({ precio: 5500 });
            mockCartModel.findOne.mockResolvedValue(null);

            const result = await service.createOrUpdate(dto);

            expect(mockMotorcyclesService.findOne).toHaveBeenCalledWith(1);
            expect(dto.items[0].precio_unitario).toBe(5500);
            expect(dto.items[0].subtotal).toBe(11000);
            expect(result).toBeDefined();
        });

        it('deberia actualizar un carrito existente', async () => {
            const dto = {
                usuario_id: 1,
                items: [{ motocicleta_id: 1, cantidad: 3, precio_unitario: 0, subtotal: 0 }],
            };

            const saveMock = jest.fn().mockResolvedValue({
                _id: '507f1f77bcf86cd799439011',
                usuario_id: 1,
                items: dto.items,
            });

            const existingCart = {
                _id: '507f1f77bcf86cd799439011',
                usuario_id: 1,
                items: [],
                save: saveMock,
            };

            mockMotorcyclesService.findOne.mockResolvedValue({ precio: 5500 });
            mockCartModel.findOne.mockResolvedValue(existingCart);

            await service.createOrUpdate(dto);

            expect(saveMock).toHaveBeenCalled();
            expect(dto.items[0].precio_unitario).toBe(5500);
        });

        it('deberia calcular precios automaticamente', async () => {
            const dto = {
                usuario_id: 1,
                items: [{ motocicleta_id: 1, cantidad: 2, precio_unitario: 0, subtotal: 0 }],
            };

            mockMotorcyclesService.findOne.mockResolvedValue({ precio: 5500 });
            mockCartModel.findOne.mockResolvedValue(null);

            const result = await service.createOrUpdate(dto);

            expect(dto.items[0].precio_unitario).toBe(5500);
            expect(dto.items[0].subtotal).toBe(11000);
            expect(result).toBeDefined();
        });

        it('deberia lanzar error si la motocicleta no existe', async () => {
            const dto = {
                usuario_id: 1,
                items: [{ motocicleta_id: 999, cantidad: 1, precio_unitario: 0, subtotal: 0 }],
            };

            mockMotorcyclesService.findOne.mockResolvedValue(null);

            await expect(service.createOrUpdate(dto)).rejects.toThrow('Motorcycle with ID 999 not found');
        });
    });

    describe('findByUser', () => {
        it('deberia encontrar el carrito de un usuario', async () => {
            const mockCart = { _id: '507f1f77bcf86cd799439011', usuario_id: 1, items: [] };

            mockCartModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockCart),
            });

            const result = await service.findByUser(1);

            expect(mockCartModel.findOne).toHaveBeenCalledWith({ usuario_id: 1 });
            expect(result).toEqual(mockCart);
        });

        it('deberia retornar null si no hay carrito', async () => {
            mockCartModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await service.findByUser(1);

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('deberia eliminar el carrito de un usuario', async () => {
            mockCartModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            });

            await service.delete(1);

            expect(mockCartModel.deleteOne).toHaveBeenCalledWith({ usuario_id: 1 });
        });
    });
});
