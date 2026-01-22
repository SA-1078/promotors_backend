import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Lead } from './lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryDto } from '../common/dto/query.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CrmService {
    private readonly logger = new Logger(CrmService.name);

    constructor(
        @InjectRepository(Lead)
        private readonly leadRepository: Repository<Lead>,
        private readonly mailService: MailService,
    ) { }

    async create(createLeadDto: CreateLeadDto): Promise<Lead> {
        const lead = this.leadRepository.create(createLeadDto);
        const savedLead = await this.leadRepository.save(lead);

        // Automate: Send email notification to Admin (Non-blocking)
        this.mailService.sendMail({
            to: process.env.MAIL_USER || '',
            subject: `Nuevo Lead: ${savedLead.nombre}`,
            message: `
                <h1>Nuevo Mensaje de Contacto</h1>
                <p><strong>Cliente:</strong> ${savedLead.nombre}</p>
                <p><strong>Email:</strong> ${savedLead.email}</p>
                <p><strong>Teléfono:</strong> ${savedLead.telefono}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${savedLead.mensaje}</p>
                <hr>
                <p>Gestionar en: <a href="http://localhost:5173/admin/leads">Panel Administrativo</a></p>
            `
        }).catch(err => this.logger.warn(`Error sending lead notification email (background): ${err.message}`));

        // Automate: Auto-response to Client + Status Update
        if (savedLead.email) {
            this.mailService.sendMail({
                to: savedLead.email,
                subject: 'Hemos recibido tu solicitud - MotorShop',
                message: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #ff5722;">¡Hola ${savedLead.nombre}!</h2>
                        <p>Hemos recibido tu solicitud correctamente.</p>
                        <p>Un asesor comercial revisará tu consulta sobre: "<strong>${savedLead.mensaje.substring(0, 50)}...</strong>" y se comunicará contigo en breve.</p>
                        <br>
                        <p>Gracias por confiar en <strong>MotorShop</strong>.</p>
                        <hr>
                        <small style="color: #666;">Este es un mensaje automático, por favor no respondas a este correo.</small>
                    </div>
                `
            }).then(async () => {
                // Update status to 'CONTACTADO' only if email sent successfully
                savedLead.estado = 'CONTACTADO';
                await this.leadRepository.save(savedLead);
                this.logger.log(`Auto-response sent to ${savedLead.email} and status updated to CONTACTADO`);
            }).catch(err => this.logger.warn(`Error sending auto-response to client: ${err.message}`));
        }

        return savedLead;
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
