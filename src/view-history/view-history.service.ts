import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViewHistory, ViewHistoryDocument } from './schemas/view-history.schema';
import { AddViewDto, AddSearchDto } from './dto/create-view-history.dto';

@Injectable()
export class ViewHistoryService {
    constructor(
        @InjectModel(ViewHistory.name) private viewHistoryModel: Model<ViewHistoryDocument>,
    ) { }

    async addView(addViewDto: AddViewDto): Promise<ViewHistory> {
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
    }

    async addSearch(addSearchDto: AddSearchDto): Promise<ViewHistory> {
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
    }

    async findByUser(userId: number): Promise<ViewHistory | null> {
        return this.viewHistoryModel.findOne({ usuario_id: userId }).exec();
    }
}
