import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';
import { Sale } from '../sales/sale.entity';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [TypeOrmModule.forFeature([Sale]), MailModule],
    controllers: [FacturasController],
    providers: [FacturasService],
    exports: [FacturasService],
})
export class FacturasModule { }
