import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    async create(@Body() dto: CreateCommentDto) {
        // Guardar nuevo comentario - público puede comentar
        const comment = await this.commentsService.create(dto);
        return new SuccessResponseDto('Comment added successfully', comment);
    }

    @Get()
    async findAll() {
        const comments = await this.commentsService.findAll();
        return new SuccessResponseDto('Comments retrieved successfully', comments);
    }

    @Get('motorcycle/:id')
    async findByMotorcycle(@Param('id', ParseIntPipe) id: number) {
        // Filtrar comentarios por ID de motocicleta
        const comments = await this.commentsService.findByMotorcycle(id);
        return new SuccessResponseDto('Motorcycle comments retrieved successfully', comments);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
        // Usuario autenticado puede editar su comentario
        const updatedComment = await this.commentsService.update(id, dto.comentario, dto.calificacion);
        return new SuccessResponseDto('Comment updated successfully', updatedComment);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'empleado')
    @Delete(':id')
    async delete(@Param('id') id: string) {
        // Solo admin y empleado pueden eliminar comentarios
        await this.commentsService.delete(id);
        return new SuccessResponseDto('Comment deleted successfully', null);
    }
}
