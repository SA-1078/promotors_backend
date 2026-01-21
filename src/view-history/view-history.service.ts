import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViewHistory, ViewHistoryDocument } from './schemas/view-history.schema';
import { AddViewDto, AddSearchDto } from './dto/create-view-history.dto';

@Injectable()
export class ViewHistoryService {
    private readonly logger = new Logger(ViewHistoryService.name);

    constructor(
        @InjectModel(ViewHistory.name) private viewHistoryModel: Model<ViewHistoryDocument>,
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
}
