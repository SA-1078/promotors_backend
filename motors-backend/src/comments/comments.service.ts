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
        const createdComment = new this.commentModel(createCommentDto);
        return createdComment.save();
    }

    async findAll(): Promise<Comment[]> {
        return this.commentModel.find().sort({ fecha: -1 }).limit(100).exec();
    }

    async findByMotorcycle(motorcycleId: number): Promise<Comment[]> {
        return this.commentModel.find({ motocicleta_id: motorcycleId }).sort({ fecha: -1 }).exec();
    }
}
