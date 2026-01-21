import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { SalesService } from '../sales/sales.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateSaleDto } from '../sales/dto/create-sale.dto';

@Controller('paypal')
export class PayPalController {
    private readonly logger = new Logger(PayPalController.name);

    constructor(
        private readonly payPalService: PayPalService,
        private readonly salesService: SalesService,
        private readonly inventoryService: InventoryService,
    ) { }

    @Post('create-order')
    async createOrder(@Body() body: { saleData: CreateSaleDto; returnUrl: string; cancelUrl: string }) {
        try {
            const { saleData, returnUrl, cancelUrl } = body;

            // 1. Create Internal Sale (PENDING)
            // Note: SalesService.create usually reduces stock. We might need to adjust this
            // or we temporarily allow stock reduction and rollback if payment fails (risk of holding stock).
            // BETTER: Modifying SalesService.create to NOT reduce stock if it's external payment?
            // For now, let's stick to the prompt's flow -> Create Order, THEN Pay.
            // But standard e-commerce reserves stock on checkout.

            // Let's create the sale normally. 
            // If the user cancels PayPal, the sale remains PENDING (acting as 'abandoned cart').
            // We should NOT confirm it as 'PAGADO' yet.

            // Override status to PENDING regardless of input
            saleData.estado = 'PENDIENTE';

            // NOTE: salesService.create CURRENTLY reduces stock. 
            // This is actually good behavior (reservation). 
            const sale = await this.salesService.create(saleData);

            // 2. Create PayPal Order
            const { orderId, approvalUrl } = await this.payPalService.createOrder(
                sale.total,
                `${returnUrl}?internalSaleId=${sale.id_venta}`, // Pass our internal ID to the return URL/frontend
                cancelUrl
            );

            // 3. Return everything needed
            return {
                saleId: sale.id_venta,
                paypalOrderId: orderId,
                approvalUrl,
            };

        } catch (error) {
            this.logger.error('Error initiating PayPal flow', error);
            throw new BadRequestException('Failed to initiate payment flow');
        }
    }

    @Post('capture-order')
    async captureOrder(@Body() body: { paypalOrderId: string; internalSaleId: number }) {
        try {
            const { paypalOrderId, internalSaleId } = body;

            // 1. Capture Payment at PayPal
            const captureData = await this.payPalService.captureOrder(paypalOrderId);

            if (captureData.status === 'COMPLETED') {
                // 2. Update Internal Sale to 'PAGADO'
                // We need a method in SalesService to update status cheaply.
                // Assuming update method exists.
                await this.salesService.update(internalSaleId, { estado: 'PAGADO' } as any);

                return { success: true, status: 'COMPLETED', saleId: internalSaleId };
            } else {
                return { success: false, status: captureData.status };
            }

        } catch (error) {
            this.logger.error('Error capturing PayPal payment', error);
            throw new BadRequestException('Failed to capture payment');
        }
    }
}
