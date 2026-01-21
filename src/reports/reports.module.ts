import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SalesModule } from '../sales/sales.module';
import { InventoryModule } from '../inventory/inventory.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        SalesModule,
        InventoryModule,
        UsersModule
    ],
    controllers: [ReportsController],
    providers: [ReportsService]
})
export class ReportsModule { }
