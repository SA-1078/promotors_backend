import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Controller('faq')
export class FaqController {
    constructor(private readonly faqService: FaqService) { }

    // Public endpoint: Get active FAQs
    @Get()
    async findAllPublic() {
        const data = await this.faqService.findAllPublic();
        return { success: true, data };
    }

    // Admin endpoint: Get all FAQs with pagination
    @Get('admin')
    async findAllAdmin(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search: string = '',
    ) {
        const data = await this.faqService.findAllAdmin(
            parseInt(page),
            parseInt(limit),
            search,
        );
        return { success: true, data };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.faqService.findOne(id);
        return { success: true, data };
    }

    @Post()
    async create(@Body() createFaqDto: CreateFaqDto) {
        const data = await this.faqService.create(createFaqDto);
        return { success: true, data, message: 'FAQ creada exitosamente' };
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFaqDto: UpdateFaqDto,
    ) {
        const data = await this.faqService.update(id, updateFaqDto);
        return { success: true, data, message: 'FAQ actualizada exitosamente' };
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.faqService.remove(id);
        return { success: true, message: 'FAQ eliminada exitosamente' };
    }
}
