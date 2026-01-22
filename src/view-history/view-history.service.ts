import { Injectable, Logger, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViewHistory, ViewHistoryDocument } from './schemas/view-history.schema';
import { AddViewDto, AddSearchDto } from './dto/create-view-history.dto';
import { MotorcyclesService } from '../motorcycles/motorcycles.service';

@Injectable()
export class ViewHistoryService {
    private readonly logger = new Logger(ViewHistoryService.name);

    constructor(
        @InjectModel(ViewHistory.name) private viewHistoryModel: Model<ViewHistoryDocument>,
        @Inject(forwardRef(() => MotorcyclesService))
        private readonly motorcyclesService: MotorcyclesService,
    ) { }

    async addView(addViewDto: AddViewDto): Promise<ViewHistory> {
        try {
            const { usuario_id, motocicleta_id } = addViewDto;

            // Actualizar documento del usuario agregando la nueva vista al array 'visto'
            // upsert: true crea el documento si no existe
            return this.viewHistoryModel.findOneAndUpdate(
                { usuario_id },
                {
                    $push: {
                        visto: { motocicleta_id, fecha: new Date() }
                    }
                },
                { upsert: true, new: true }
            ).exec();
        } catch (err) {
            this.logger.error('Error adding view to history', err.stack);
            throw new InternalServerErrorException('Failed to add view to history');
        }
    }

    async addSearch(addSearchDto: AddSearchDto): Promise<ViewHistory> {
        try {
            const { usuario_id, termino } = addSearchDto;

            // Actualizar documento agregando término al array 'busquedas'
            return this.viewHistoryModel.findOneAndUpdate(
                { usuario_id },
                {
                    $push: {
                        busquedas: { termino, fecha: new Date() }
                    }
                },
                { upsert: true, new: true }
            ).exec();
        } catch (err) {
            this.logger.error('Error adding search to history', err.stack);
            throw new InternalServerErrorException('Failed to add search to history');
        }
    }

    async findByUser(userId: number): Promise<ViewHistory | null> {
        try {
            return this.viewHistoryModel.findOne({ usuario_id: userId }).exec();
        } catch (err) {
            this.logger.error(`Error finding history for user ${userId}`, err.stack);
            throw new InternalServerErrorException('Failed to retrieve user history');
        }
    }

    async removeViewsByMotorcycleId(motoId: number): Promise<void> {
        try {
            // Eliminar la referencia a la moto de todos los registros de historial
            await this.viewHistoryModel.updateMany(
                { 'visto.motocicleta_id': motoId },
                { $pull: { visto: { motocicleta_id: motoId } } }
            ).exec();
        } catch (err) {
            // Log error but don't block the hard delete process if this fails (e.g. auth issues)
            this.logger.warn(`Failed to remove views for motorcycle ID ${motoId}: ${err.message}`);
        }
    }

    async getGlobalTopViews(limit: number = 5): Promise<any[]> {
        const aggregated = await this.viewHistoryModel.aggregate([
            { $unwind: '$visto' }, // Descommprimir el array de vistos
            {
                $group: {
                    _id: '$visto.motocicleta_id',
                    count: { $sum: 1 },
                    lastViewed: { $max: '$visto.fecha' }
                }
            },
            { $sort: { count: -1 } }, // Ordenar por más vistos
            { $limit: limit },
            {
                $project: {
                    motocicleta_id: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]).exec();

        // Enriquecer con nombres de motos
        const ids = aggregated.map(a => a.motocicleta_id);
        if (ids.length > 0) {
            const motos = await this.motorcyclesService.findByIds(ids);
            const motoMap = new Map(motos.map(m => [m.id_moto, m.nombre]));

            return aggregated.map(item => ({
                ...item,
                modelo: motoMap.get(item.motocicleta_id) || `Moto #${item.motocicleta_id}`
            }));
        }

        return aggregated;
    }

    async getGlobalTopSearches(limit: number = 10): Promise<any[]> {
        return this.viewHistoryModel.aggregate([
            { $unwind: '$busquedas' },
            {
                $match: {
                    'busquedas.termino': { $ne: '', $exists: true, $not: { $type: 'null' } }
                }
            }, // Filtrar vacíos
            {
                $group: {
                    _id: '$busquedas.termino',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $project: {
                    termino: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]).exec();
    }
}
