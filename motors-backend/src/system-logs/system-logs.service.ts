import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemLog, SystemLogDocument } from './schemas/system-log.schema';
import { CreateSystemLogDto } from './dto/create-system-log.dto';

@Injectable()
export class SystemLogsService {
    constructor(
        @InjectModel(SystemLog.name) private systemLogModel: Model<SystemLogDocument>,
    ) { }

    async create(createSystemLogDto: CreateSystemLogDto): Promise<SystemLog> {
        const createdLog = new this.systemLogModel(createSystemLogDto);
        return createdLog.save();
    }

    async findAll(): Promise<SystemLog[]> {
        return this.systemLogModel.find().sort({ fecha: -1 }).limit(100).exec();
    }

    // Usually logs are append-only, but adding basic findOne if needed
    async findByUser(userId: number): Promise<SystemLog[]> {
        return this.systemLogModel.find({ usuario_id: userId }).exec();
    }
}
