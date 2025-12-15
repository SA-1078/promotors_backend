import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Lead } from './lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class CrmService {
    constructor(
        @InjectRepository(Lead)
        private readonly leadRepository: Repository<Lead>,
    ) { }

    async create(createLeadDto: CreateLeadDto): Promise<Lead> {
        const lead = this.leadRepository.create(createLeadDto);
        return await this.leadRepository.save(lead);
    }

    async findAll(queryDto: QueryDto): Promise<Pagination<Lead>> {
        const { page, limit, search } = queryDto;
        const query = this.leadRepository.createQueryBuilder('lead');

        if (search) {
            // Filtrar leads por nombre o email
            query.where('lead.nombre ILIKE :search', { search: `%${search}%` })
                .orWhere('lead.email ILIKE :search', { search: `%${search}%` });
        }

        query.orderBy('lead.id_lead', 'DESC');

        return await paginate<Lead>(query, { page, limit });
    }

    async findOne(id: number): Promise<Lead | null> {
        return await this.leadRepository.findOne({ where: { id_lead: id } });
    }

    async update(id: number, updateLeadDto: UpdateLeadDto): Promise<Lead | null> {
        const lead = await this.findOne(id);
        if (!lead) return null;

        Object.assign(lead, updateLeadDto);
        return await this.leadRepository.save(lead);
    }

    async remove(id: number): Promise<Lead | null> {
        const lead = await this.findOne(id);
        if (!lead) return null;

        return await this.leadRepository.remove(lead);
    }
}
