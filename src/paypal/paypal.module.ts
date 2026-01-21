import { Module } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { PayPalController } from './paypal.controller';
import { SalesModule } from '../sales/sales.module';
import { InventoryModule } from '../inventory/inventory.module'; // Import Inventory to reduce stock

@Module({
    imports: [SalesModule, InventoryModule],
    controllers: [PayPalController],
    providers: [PayPalService],
})
export class PayPalModule { }
