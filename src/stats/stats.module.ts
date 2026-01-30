import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../users/user.entity';
import { Motorcycle } from '../motorcycles/motorcycle.entity';
import { Category } from '../categories/category.entity';
import { Sale } from '../sales/sale.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Motorcycle, Category, Sale])],
    controllers: [StatsController],
    providers: [StatsService],
    exports: [StatsService],
})
export class StatsModule { }
