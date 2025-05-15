import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe()); // Thêm dòng này
  await app.listen(process.env.PORT ?? 5555);
}
bootstrap().catch((err) => console.error(err));
