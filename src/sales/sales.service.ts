import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Sale } from './sale.entity';
import { SaleDetail } from './sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { QueryDto } from '../common/dto/query.dto';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
        @InjectRepository(SaleDetail)
        private readonly saleDetailRepository: Repository<SaleDetail>,
        private dataSource: DataSource,
    ) { }

    async create(createSaleDto: CreateSaleDto): Promise<Sale> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { detalles, ...saleData } = createSaleDto;

            const sale = queryRunner.manager.create(Sale, saleData);
            const savedSale = await queryRunner.manager.save(sale);

            const saleDetails = detalles.map(detail =>
                queryRunner.manager.create(SaleDetail, { ...detail, venta: savedSale })
            );

            await queryRunner.manager.save(saleDetails);
            savedSale.detalles = saleDetails;

            await queryRunner.commitTransaction();
            return savedSale;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(queryDto: QueryDto): Promise<Pagination<Sale>> {
        const { page, limit } = queryDto;
        const query = this.saleRepository.createQueryBuilder('sale')
            .leftJoinAndSelect('sale.usuario', 'user')
            .leftJoinAndSelect('sale.detalles', 'details')
            .leftJoinAndSelect('details.motocicleta', 'motorcycle');

        query.orderBy('sale.id_venta', 'DESC');

        return await paginate<Sale>(query, { page, limit });
    }

    async findOne(id: number): Promise<Sale | null> {
        return await this.saleRepository.findOne({
            where: { id_venta: id },
            relations: ['usuario', 'detalles', 'detalles.motocicleta'],
        });
    }

    
    async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale | null> {
        const sale = await this.findOne(id);
        if (!sale) return null;

        
        const { detalles, ...simpleData } = updateSaleDto;
        Object.assign(sale, simpleData);

        return await this.saleRepository.save(sale);
    }

    async remove(id: number): Promise<Sale | null> {
        const sale = await this.findOne(id);
        if (!sale) return null;

        return await this.saleRepository.remove(sale);
    }
}
