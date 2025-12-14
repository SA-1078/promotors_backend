import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ViewHistory, ViewHistorySchema } from './schemas/view-history.schema';
import { ViewHistoryService } from './view-history.service';
import { ViewHistoryController } from './view-history.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ViewHistory.name, schema: ViewHistorySchema }]),
    ],
    controllers: [ViewHistoryController],
    providers: [ViewHistoryService],
})
export class ViewHistoryModule { }
