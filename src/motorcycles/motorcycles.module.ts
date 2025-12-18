import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotorcyclesService } from './motorcycles.service';
import { MotorcyclesController } from './motorcycles.controller';
import { Motorcycle } from './motorcycle.entity';
import { ViewHistoryModule } from '../view-history/view-history.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Motorcycle]),
        ViewHistoryModule,
        AuthModule
    ],
    controllers: [MotorcyclesController],
    providers: [MotorcyclesService],
    exports: [MotorcyclesService],
})
export class MotorcyclesModule { }
