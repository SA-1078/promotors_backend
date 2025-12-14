import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MotorcyclesService } from './motorcycles.service';
import { MotorcyclesController } from './motorcycles.controller';
import { Motorcycle } from './motorcycle.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Motorcycle])],
    controllers: [MotorcyclesController],
    providers: [MotorcyclesService],
    exports: [MotorcyclesService],
})
export class MotorcyclesModule { }
