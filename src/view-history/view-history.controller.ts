import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ViewHistoryService } from './view-history.service';
import { AddViewDto, AddSearchDto } from './dto/create-view-history.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('view-history')
export class ViewHistoryController {
    constructor(private readonly viewHistoryService: ViewHistoryService) { }

    @Post('view')
    async addView(@Body() dto: AddViewDto) {
        const history = await this.viewHistoryService.addView(dto);
        return new SuccessResponseDto('View added successfully', history);
    }

    @Post('search')
    async addSearch(@Body() dto: AddSearchDto) {
        const history = await this.viewHistoryService.addSearch(dto);
        return new SuccessResponseDto('Search added successfully', history);
    }

    @UseGuards(JwtAuthGuard)
    @Get('history')
    async getMyHistory(@Req() req) {
        // Obtener historial del usuario logueado (Privacidad)
        const userId = req.user.userId;
        const history = await this.viewHistoryService.findByUser(userId);
        return new SuccessResponseDto('My view history retrieved successfully', history || { usuario_id: userId, visto: [], busquedas: [] });
    }

    // Mantener para admin si es necesario, o eliminar si se desea estricta privacidad
    @Get('user/:id')
    async findByUser(@Param('id', ParseIntPipe) id: number) {
        // Obtener historial completo (vvistas y búsquedas) de un usuario

        const history = await this.viewHistoryService.findByUser(id);
        return new SuccessResponseDto('View history retrieved successfully', history || { usuario_id: id, visto: [], busquedas: [] });
    }
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('analytics/top-views')
    async getTopViews() {
        const stats = await this.viewHistoryService.getGlobalTopViews();
        return new SuccessResponseDto('Top views retrieved successfully', stats);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('analytics/top-searches')
    async getTopSearches() {
        const stats = await this.viewHistoryService.getGlobalTopSearches();
        return new SuccessResponseDto('Top searches retrieved successfully', stats);
    }
}
