import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { Lead } from './lead.entity';

import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Lead]),
        MailModule,
    ],
    controllers: [CrmController],
    providers: [CrmService],
    exports: [CrmService],
})
export class CrmModule { }
