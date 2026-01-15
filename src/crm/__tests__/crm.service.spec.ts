import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmService } from '../crm.service';
import { Lead } from '../lead.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';


jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(),
}));

import { paginate } from 'nestjs-typeorm-paginate';

describe('CrmService', () => {
    let service: CrmService;
    let repository: Repository<Lead>;

    const mockLead = {
        id_lead: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '555-1234',
        estado: 'nuevo',
        mensaje: 'Necesito información',
    };

    const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
    };

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CrmService,
                { provide: getRepositoryToken(Lead), useValue: mockRepository },
            ],
        }).compile();

        service = module.get<CrmService>(CrmService);
        repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
        jest.clearAllMocks();
    });

    it('deberia estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('deberia crear un lead', async () => {
            mockRepository.create.mockReturnValue(mockLead);
            mockRepository.save.mockResolvedValue(mockLead);

            const result = await service.create(mockLead);

            expect(mockRepository.create).toHaveBeenCalledWith(mockLead);
            expect(result).toEqual(mockLead);
        });
    });

    describe('findAll', () => {
        it('deberia retornar leads paginados', async () => {
            const paginatedResult = {
                items: [mockLead],
                meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
            };

            (paginate as jest.Mock).mockResolvedValue(paginatedResult);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('lead');
            expect(result).toEqual(paginatedResult);
        });

        it('deberia aplicar filtro de busqueda', async () => {
            (paginate as jest.Mock).mockResolvedValue({ items: [], meta: {} });

            await service.findAll({ page: 1, limit: 10, search: 'Juan' });

            expect(mockQueryBuilder.where).toHaveBeenCalled();
            expect(mockQueryBuilder.orWhere).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('deberia retornar un lead', async () => {
            mockRepository.findOne.mockResolvedValue(mockLead);

            const result = await service.findOne(1);

            expect(result).toEqual(mockLead);
        });

        it('deberia retornar null si no se encuentra', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.findOne(999);

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('deberia actualizar un lead', async () => {
            mockRepository.findOne.mockResolvedValue(mockLead);
            mockRepository.save.mockResolvedValue({ ...mockLead, estado: 'contactado' });

            const result = await service.update(1, { estado: 'contactado' });

            expect(result).toBeDefined();
            expect(result!.estado).toBe('contactado');
        });

        it('deberia retornar null si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.update(999, {});

            expect(result).toBeNull();
        });
    });

    describe('remove', () => {
        it('deberia eliminar un lead', async () => {
            mockRepository.findOne.mockResolvedValue(mockLead);
            mockRepository.remove.mockResolvedValue(mockLead);

            const result = await service.remove(1);

            expect(result).toEqual(mockLead);
        });

        it('deberia retornar null si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.remove(999);

            expect(result).toBeNull();
        });
    });
});
