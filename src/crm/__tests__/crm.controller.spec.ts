import { Test, TestingModule } from '@nestjs/testing';
import { CrmController } from '../crm.controller';
import { CrmService } from '../crm.service';
import { SuccessResponseDto } from '../../common/dto/response.dto';
import { NotFoundException } from '@nestjs/common';

describe('CrmController', () => {
    let controller: CrmController;

    const mockLead = {
        id_lead: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '555-1234',
        estado: 'nuevo',
    };

    const mockCrmService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CrmController],
            providers: [{ provide: CrmService, useValue: mockCrmService }],
        }).compile();

        controller = module.get<CrmController>(CrmController);
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(controller).toBeDefined();
    });

    it('deberia crear un lead', async () => {
        mockCrmService.create.mockResolvedValue(mockLead);
        const result = await controller.create(mockLead as any);
        expect(result).toBeInstanceOf(SuccessResponseDto);
        expect(result.message).toBe('Lead created successfully');
    });

    it('deberia retornar leads paginados', async () => {
        const paginatedResult = { items: [mockLead], meta: {} };
        mockCrmService.findAll.mockResolvedValue(paginatedResult);
        const result = await controller.findAll({ page: 1, limit: 10 });
        expect(result.message).toBe('Leads retrieved successfully');
    });

    it('deberia retornar un lead', async () => {
        mockCrmService.findOne.mockResolvedValue(mockLead);
        const result = await controller.findOne(1);
        expect(result.message).toBe('Lead retrieved successfully');
    });

    it('deberia lanzar NotFoundException si el lead no existe', async () => {
        mockCrmService.findOne.mockResolvedValue(null);
        await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('deberia actualizar un lead', async () => {
        mockCrmService.update.mockResolvedValue(mockLead);
        const result = await controller.update(1, {});
        expect(result.message).toBe('Lead updated successfully');
    });

    it('deberia eliminar un lead', async () => {
        mockCrmService.remove.mockResolvedValue(mockLead);
        const result = await controller.remove(1);
        expect(result.message).toBe('Lead deleted successfully');
    });
});
