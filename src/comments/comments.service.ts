import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

import { UsersService } from '../users/users.service';
import { MotorcyclesService } from '../motorcycles/motorcycles.service';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        private usersService: UsersService,
        private motorcyclesService: MotorcyclesService,
    ) { }

    async create(createCommentDto: CreateCommentDto): Promise<Comment> {
        // Crear instancia del modelo Mongoose y guardar
        const createdComment = new this.commentModel(createCommentDto);
        return createdComment.save();
    }

    async findAll(): Promise<any[]> {
        const comments = await this.commentModel.find().sort({ fecha: -1 }).limit(100).exec();

        // Enriquecer comentarios con nombres de usuario y motocicleta
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
            let userName = 'Usuario MotorShop';
            let motoName = 'Motocicleta';

            // Buscar usuario
            try {
                const user = await this.usersService.findOne(comment.usuario_id);
                if (user) userName = user.nombre;
            } catch (error) {
            }

            // Buscar motocicleta
            try {
                const moto = await this.motorcyclesService.findOne(comment.motocicleta_id);
                if (moto) motoName = moto.nombre;
            } catch (error) {
            }

            return {
                ...comment.toObject(),
                authorName: userName,
                nombre_usuario: userName,
                motorcycleName: motoName,
                nombre_moto: motoName
            };
        }));

        return enrichedComments;
    }

    async findByMotorcycle(motorcycleId: number): Promise<Comment[]> {
        // Buscar comentarios de una moto específica ordenados por fecha descendente
        return this.commentModel.find({ motocicleta_id: motorcycleId }).sort({ fecha: -1 }).exec();
    }

    async update(id: string, comentario: string, calificacion: number): Promise<Comment | null> {
        return this.commentModel.findByIdAndUpdate(
            id,
            { comentario, calificacion },
            { new: true }
        ).exec();
    }

    async delete(id: string): Promise<any> {
        return this.commentModel.findByIdAndDelete(id).exec();
    }
}
