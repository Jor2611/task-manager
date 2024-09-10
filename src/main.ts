import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS,
    allowedHeaders: 'Accept, Authorization, Content-Type, Content-Disposition',
    methods: 'HEAD, GET, POST, PUT, PATCH, DELETE'
  })
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
