import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { MotorcyclesModule } from './motorcycles/motorcycles.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { CrmModule } from './crm/crm.module';
import { SystemLogsModule } from './system-logs/system-logs.module';
import { CommentsModule } from './comments/comments.module';
import { CartsModule } from './carts/carts.module';
import { ViewHistoryModule } from './view-history/view-history.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PayPalModule } from './paypal/paypal.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    CategoriesModule,
    MotorcyclesModule,
    InventoryModule,
    SalesModule,
    CrmModule,
    SystemLogsModule,
    CommentsModule,
    CartsModule,
    ViewHistoryModule,
    AuthModule,
    MailModule,
    PayPalModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
