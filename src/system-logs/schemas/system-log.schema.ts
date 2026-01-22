import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SystemLogDocument = SystemLog & Document;

@Schema({ collection: 'logs_sistema', timestamps: false })
export class SystemLog {
    @Prop({ required: true })
    usuario_id: number;

    @Prop({ required: true })
    accion: string;

    @Prop({ default: Date.now })
    fecha: Date;

    @Prop()
    ip: string;

    @Prop({ type: Object })
    detalles: Record<string, any>;
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);
