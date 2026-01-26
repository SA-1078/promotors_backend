import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Lead } from './lead.entity';
import { QueryDto } from '../common/dto/query.dto';


// CRM = crm_lead posible cliente o interesado

@Controller('crm')
export class CrmController {
    constructor(private readonly crmService: CrmService) { }

    @Post()
    async create(@Body() dto: CreateLeadDto) {
        // Público puede crear leads (formulario de contacto)
        const lead = await this.crmService.create(dto);
        return new SuccessResponseDto('Lead created successfully', lead);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Get()
    async findAll(@Query() query: QueryDto): Promise<SuccessResponseDto<Pagination<Lead>>> {
        // Solo admin y empleado pueden ver todos los leads
        if (query.limit && query.limit > 100) query.limit = 100;
        const result = await this.crmService.findAll(query);
        return new SuccessResponseDto('Leads retrieved successfully', result);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const lead = await this.crmService.findOne(id);
        if (!lead) throw new NotFoundException('Lead not found');
        return new SuccessResponseDto('Lead retrieved successfully', lead);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeadDto) {
        const lead = await this.crmService.update(id, dto);
        if (!lead) throw new NotFoundException('Lead not found');
        return new SuccessResponseDto('Lead updated successfully', lead);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        // Solo admin puede eliminar leads
        const lead = await this.crmService.remove(id);
        if (!lead) throw new NotFoundException('Lead not found');
        return new SuccessResponseDto('Lead deleted successfully', lead);
    }
}
