import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './exceptionFilters/http.exceptionFilter';
import { HttpInterceptor } from './interceptors/http.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbOptions } from './dataSource.options';
import { TaskModule } from './task/task.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: !`.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dbOptions
    }),
    TaskModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({ whitelist: true })
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ],
})
export class AppModule {}
