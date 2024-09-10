import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbOptions } from './dataSource.options';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: !`.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dbOptions
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
