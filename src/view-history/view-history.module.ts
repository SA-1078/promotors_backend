import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ViewHistory, ViewHistorySchema } from './schemas/view-history.schema';
import { ViewHistoryService } from './view-history.service';
import { ViewHistoryController } from './view-history.controller';
import { MotorcyclesModule } from '../motorcycles/motorcycles.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ViewHistory.name, schema: ViewHistorySchema }]),
        forwardRef(() => MotorcyclesModule),
    ],
    controllers: [ViewHistoryController],
    providers: [ViewHistoryService],
    exports: [ViewHistoryService],
})
export class ViewHistoryModule { }
