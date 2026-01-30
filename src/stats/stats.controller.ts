import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { SuccessResponseDto } from '../common/dto/response.dto';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('public')
    async getPublicStats() {
        const stats = await this.statsService.getPublicStats();
        return new SuccessResponseDto('Public stats retrieved successfully', stats);
    }
}
