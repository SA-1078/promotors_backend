import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global ValidationPipe: Valida automáticamente todos los DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Remueve propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
    transform: true,            // Transforma los tipos automáticamente
  }));

  // CORS: Permite acceso desde frontends
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // En producción especificar URL exacta
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application running on port ${port}`);

}
bootstrap();
