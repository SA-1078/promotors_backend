import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('system-logs')
export class SystemLogsController {
    constructor(private readonly systemLogsService: SystemLogsService) { }

    @Post()
    async create(@Body() dto: CreateSystemLogDto) {
        const log = await this.systemLogsService.create(dto);
        return new SuccessResponseDto('Log created successfully', log);
    }

    @Get()
    async findAll() {
        const logs = await this.systemLogsService.findAll();
        return new SuccessResponseDto('Logs retrieved successfully', logs);
    }

    @Get('user/:id')
    async findByUser(@Param('id', ParseIntPipe) id: number) {
        const logs = await this.systemLogsService.findByUser(id);
        return new SuccessResponseDto('User logs retrieved successfully', logs);
    }
}
