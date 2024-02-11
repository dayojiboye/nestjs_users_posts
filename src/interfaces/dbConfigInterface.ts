import { Dialect } from 'sequelize';

export interface dbConfigInterface {
  HOST: string | undefined;
  USER: string;
  PASSWORD: string;
  DB: string;
  dialect: Dialect | undefined;

  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}
