import { DataSourceOptions } from "typeorm";
import * as dotenv from 'dotenv';
import { join } from "path";

dotenv.config({ path:  `.env.${process.env.NODE_ENV}` });
let dsOptions: DataSourceOptions;

switch(process.env.NODE_ENV){
  case 'development':
    dsOptions = {
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      database: process.env.PG_DATABASE,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      migrations: [join(__dirname, '..', 'migrations/*.js')],
      entities: [join(__dirname, '..', '**/*.entity.js')],
      synchronize: false,
      migrationsRun: false
    };
    break;
    
  case 'test':
    dsOptions = {
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      database: process.env.PG_DATABASE,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      migrations: [join(__dirname, '..', 'migrations/*.js')],
      entities: [join(__dirname, '..', '**/*.entity.ts')],
      synchronize: false,
      migrationsRun: true
    };
    break;

  case 'production':
    dsOptions = {
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      database: process.env.PG_DATABASE,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      migrations: [join(__dirname, '..', 'migrations/*.js')],
      entities: [join(__dirname, '..', '**/*.entity.js')],
      synchronize: false,
      migrationsRun: true,
      ssl: {
        rejectUnauthorized: false
      }
    };
    break;

  default:
    throw new Error(`Unknown environment: ${process.env.NODE_ENV}`);
}

export const dbOptions = dsOptions;