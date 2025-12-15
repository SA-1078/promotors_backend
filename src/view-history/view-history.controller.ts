import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ViewHistoryService } from './view-history.service';
import { AddViewDto, AddSearchDto } from './dto/create-view-history.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('view-history')
export class ViewHistoryController {
    constructor(private readonly viewHistoryService: ViewHistoryService) { }

    @Post('view')
    async addView(@Body() dto: AddViewDto) {
        // Registrar que un usuario vio una motocicleta
        const history = await this.viewHistoryService.addView(dto);
        return new SuccessResponseDto('View added successfully', history);
    }

    @Post('search')
    async addSearch(@Body() dto: AddSearchDto) {
        // Registrar historial de términos de búsqueda del usuario
        const history = await this.viewHistoryService.addSearch(dto);
        return new SuccessResponseDto('Search added successfully', history);
    }

    @Get('user/:id')
    async findByUser(@Param('id', ParseIntPipe) id: number) {
        // Obtener historial completo (vistas y búsquedas) de un usuario
        const history = await this.viewHistoryService.findByUser(id);
        return new SuccessResponseDto('View history retrieved successfully', history || { usuario_id: id, visto: [], busquedas: [] });
    }
}
