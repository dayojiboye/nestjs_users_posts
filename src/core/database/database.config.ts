/* eslint-disable @typescript-eslint/no-var-requires */
// import * as dotenv from 'dotenv';
// import { IDatabaseConfig } from './interfaces/dbConfig.interface';
const dotenv = require('dotenv');

dotenv.config();

const databaseConfig = {
  development: {
    username: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME_DEVELOPMENT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
  },
  test: {
    username: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
  },
  production: {
    username: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME_PRODUCTION,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  },
};

module.exports = databaseConfig;
