import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    async create(@Body() dto: CreateCommentDto) {
        // Guardar nuevo comentario
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
}
