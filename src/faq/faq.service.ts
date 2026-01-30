import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
    constructor(
        @InjectRepository(Faq)
        private faqRepository: Repository<Faq>,
    ) { }

    // Public: Get all active FAQs
    async findAllPublic(): Promise<Faq[]> {
        return this.faqRepository.find({
            where: { activo: true },
            order: { orden: 'ASC', fechaCreacion: 'DESC' },
        });
    }

    // Admin: Get all FAQs with pagination and search
    async findAllAdmin(page: number = 1, limit: number = 20, search: string = '') {
        const skip = (page - 1) * limit;

        const where = search
            ? [
                { pregunta: Like(`%${search}%`) },
                { respuesta: Like(`%${search}%`) },
                { categoria: Like(`%${search}%`) },
            ]
            : {};

        const [items, total] = await this.faqRepository.findAndCount({
            where,
            order: { orden: 'ASC', fechaCreacion: 'DESC' },
            take: limit,
            skip,
        });

        return {
            items,
            meta: {
                totalItems: total,
                itemCount: items.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        };
    }

    async findOne(id: number): Promise<Faq> {
        const faq = await this.faqRepository.findOne({ where: { id_faq: id } });
        if (!faq) {
            throw new NotFoundException(`FAQ con ID ${id} no encontrada`);
        }
        return faq;
    }

    async create(createFaqDto: CreateFaqDto): Promise<Faq> {
        const faq = this.faqRepository.create(createFaqDto);
        return this.faqRepository.save(faq);
    }

    async update(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
        const faq = await this.findOne(id);
        Object.assign(faq, updateFaqDto);
        return this.faqRepository.save(faq);
    }

    async remove(id: number): Promise<void> {
        const faq = await this.findOne(id);
        await this.faqRepository.remove(faq);
    }
}
