import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    ) { }

    async create(createCommentDto: CreateCommentDto): Promise<Comment> {
        // Crear instancia del modelo Mongoose y guardar
        const createdComment = new this.commentModel(createCommentDto);
        return createdComment.save();
    }

    async findAll(): Promise<Comment[]> {
        return this.commentModel.find().sort({ fecha: -1 }).limit(100).exec();
    }

    async findByMotorcycle(motorcycleId: number): Promise<Comment[]> {
        // Buscar comentarios de una moto específica ordenados por fecha descendente
        return this.commentModel.find({ motocicleta_id: motorcycleId }).sort({ fecha: -1 }).exec();
    }

    async delete(id: string): Promise<any> {
        return this.commentModel.findByIdAndDelete(id).exec();
    }
}
