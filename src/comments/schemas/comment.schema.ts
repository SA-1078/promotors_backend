import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ collection: 'comentarios', timestamps: false })
export class Comment {
    @Prop({ required: true })
    usuario_id: number;

    @Prop({ required: true })
    motocicleta_id: number;

    @Prop({ required: true, min: 1, max: 5 })
    calificacion: number;

    @Prop({ required: true })
    comentario: string;

    @Prop({ default: Date.now })
    fecha: Date;

    @Prop({ default: false })
    moderado: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
