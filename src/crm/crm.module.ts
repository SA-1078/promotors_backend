import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { Lead } from './lead.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Lead])],
    controllers: [CrmController],
    providers: [CrmService],
    exports: [CrmService],
})
export class CrmModule { }
