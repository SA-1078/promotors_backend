import {
    Controller, Get, Post, Put, Delete, Body, Param,
    Query, NotFoundException, ParseIntPipe
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Lead } from './lead.entity';
import { QueryDto } from '../common/dto/query.dto';

@Controller('crm')
export class CrmController {
    constructor(private readonly crmService: CrmService) { }

    @Post()
    async create(@Body() dto: CreateLeadDto) {
        // Registrar posible cliente (Lead)
        const lead = await this.crmService.create(dto);
        return new SuccessResponseDto('Lead created successfully', lead);
    }

    @Get()
    async findAll(@Query() query: QueryDto): Promise<SuccessResponseDto<Pagination<Lead>>> {
        if (query.limit && query.limit > 100) query.limit = 100;
        const result = await this.crmService.findAll(query);
        return new SuccessResponseDto('Leads retrieved successfully', result);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const lead = await this.crmService.findOne(id);
        if (!lead) throw new NotFoundException('Lead not found');
        return new SuccessResponseDto('Lead retrieved successfully', lead);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeadDto) {
        const lead = await this.crmService.update(id, dto);
        if (!lead) throw new NotFoundException('Lead not found');
        return new SuccessResponseDto('Lead updated successfully', lead);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const lead = await this.crmService.remove(id);
        if (!lead) throw new NotFoundException('Lead not found');
        return new SuccessResponseDto('Lead deleted successfully', lead);
    }
}
