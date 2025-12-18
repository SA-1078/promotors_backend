import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Sale } from './sale.entity';
import { SaleDetail } from './sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { QueryDto } from '../common/dto/query.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
        @InjectRepository(SaleDetail)
        private readonly saleDetailRepository: Repository<SaleDetail>,
        private readonly dataSource: DataSource,
        private readonly systemLogsService: SystemLogsService,
        private readonly inventoryService: InventoryService,
    ) { }

    async create(createSaleDto: CreateSaleDto): Promise<Sale> {
        // Iniciar transacción para asegurar integridad (Venta + Detalles)
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { detalles, ...saleData } = createSaleDto;

            // 1. Guardar la cabecera de la venta
            const sale = queryRunner.manager.create(Sale, saleData);
            const savedSale = await queryRunner.manager.save(sale);

            // 2. Crear y guardar los detalles de la venta relacionándolos con la cabecera
            const saleDetails: SaleDetail[] = [];
            for (const detail of detalles) {
                // Reducir stock en inventario (lanza error si no hay stock)
                await this.inventoryService.reduceStock(detail.id_moto, detail.cantidad);

                saleDetails.push(queryRunner.manager.create(SaleDetail, { ...detail, venta: savedSale }));
            }

            await queryRunner.manager.save(saleDetails);
            savedSale.detalles = saleDetails;

            // Confirmar transacción si todo sale bien
            await queryRunner.commitTransaction();

            // Automate: Log sale creation
            await this.systemLogsService.create({
                usuario_id: savedSale.id_usuario,
                accion: 'SALE_CREATED',
                detalles: { sale_id: savedSale.id_venta, total: savedSale.total }
            }).catch(err => console.error('Error logging sale creation', err));

            return savedSale;
        } catch (err) {
            // Revertir cambios si algo falla
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            // Liberar recursos
            await queryRunner.release();
        }
    }

    async findAll(queryDto: QueryDto): Promise<Pagination<Sale>> {
        const { page, limit } = queryDto;
        // Consultar ventas con relaciones completas: usuario, detalles y motocicleta en cada detalle
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

    // Update simple fields usually, complex detail updates require more logic
    async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale | null> {
        const sale = await this.findOne(id);
        if (!sale) return null;

        // Separate logic for details update if needed, for now just update main fields
        const { detalles, ...simpleData } = updateSaleDto;
        Object.assign(sale, simpleData);

        return await this.saleRepository.save(sale);
    }

    async remove(id: number): Promise<Sale | null> {
        const sale = await this.findOne(id);
        if (!sale) return null;

        const result = await this.saleRepository.remove(sale);

        // Automate: Log sale deletion
        await this.systemLogsService.create({
            usuario_id: sale.id_usuario,
            accion: 'SALE_DELETED',
            detalles: { sale_id: id }
        }).catch(err => console.error('Error logging sale deletion', err));

        return result;
    }
}
