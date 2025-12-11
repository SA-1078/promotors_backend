import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ViewHistoryDocument = ViewHistory & Document;

@Schema()
export class ViewedItem {
    @Prop({ required: true })
    motocicleta_id: number;

    @Prop({ default: Date.now })
    fecha: Date;
}

const ViewedItemSchema = SchemaFactory.createForClass(ViewedItem);

@Schema()
export class SearchItem {
    @Prop({ required: true })
    termino: string;

    @Prop({ default: Date.now })
    fecha: Date;
}

const SearchItemSchema = SchemaFactory.createForClass(SearchItem);

@Schema({ collection: 'historial_vistas' })
export class ViewHistory {
    @Prop({ required: true, unique: true })
    usuario_id: number;

    @Prop({ type: [ViewedItemSchema], default: [] })
    visto: ViewedItem[];

    @Prop({ type: [SearchItemSchema], default: [] })
    busquedas: SearchItem[];
}

export const ViewHistorySchema = SchemaFactory.createForClass(ViewHistory);
