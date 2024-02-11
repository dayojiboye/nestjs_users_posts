import { Sequelize } from 'sequelize';
import { dbConfigInterface } from 'src/interfaces/dbConfigInterface';

const dbConfig: dbConfigInterface = {
  HOST: 'localhost',
  USER: 'root',
  PASSWORD: '',
  DB: process.env.DB,
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.log('Error' + err));

export default sequelize;
