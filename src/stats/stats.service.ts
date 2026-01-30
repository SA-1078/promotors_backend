import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Motorcycle } from '../motorcycles/motorcycle.entity';
import { Category } from '../categories/category.entity';
import { Sale } from '../sales/sale.entity';

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Motorcycle)
        private motorcycleRepository: Repository<Motorcycle>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(Sale)
        private saleRepository: Repository<Sale>,
    ) { }

    async getPublicStats() {
        const [totalMotorcycles, totalCategories, totalSales, totalClients] = await Promise.all([
            this.motorcycleRepository.count(),
            this.categoryRepository.count(),
            this.saleRepository.count(),
            this.userRepository.count({ where: { rol: 'cliente' } }),
        ]);

        return {
            totalMotorcycles,
            totalCategories,
            totalSales,
            totalClients,
        };
    }
}
