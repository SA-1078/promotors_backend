import { Injectable, Logger } from '@nestjs/common';
import { SalesService } from '../sales/sales.service';
import { InventoryService } from '../inventory/inventory.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        private readonly salesService: SalesService,
        private readonly inventoryService: InventoryService,
        private readonly usersService: UsersService,
    ) { }

    async getDashboardStats() {
        // Aggregate data from different services
        // Note: Services need to expose count/sum methods. 
        // If they don't, we might need to modify them or use findAll with limit 1 and get count from metadata?
        // paginate returns { items, meta: { totalItems ... } }

        // 1. Sales Stats
        const salesData = await this.salesService.findAll({ page: 1, limit: 1 } as any);
        const totalSalesCount = salesData.meta.totalItems;

        // Calculate Total Revenue (This is expensive if we fetch all, better to have a specific query in SalesService)
        // For the demo, let's assume we can fetch all or just use a placeholder if it's too heavy.
        // Actually, let's create a custom query in SalesService later for sum(total).
        // For now, let's just show count.

        // 2. Users Stats
        const usersData = await this.usersService.findAll({ page: 1, limit: 1 } as any);
        const totalUsers = usersData.meta.totalItems;

        // 3. Inventory Stats
        const inventoryData = await this.inventoryService.findAll({ page: 1, limit: 1000 } as any); // Fetch more to check low stock
        const totalInventoryItems = inventoryData.meta.totalItems;
        const lowStockItems = inventoryData.items.filter(item => item.stock_actual < 5).length;

        return {
            totalSalesCount,
            totalUsers,
            totalInventoryItems,
            lowStockItems,
            // Mock revenue for now or calculate correctly if time permits
            totalRevenue: 0
        };
    }
}
