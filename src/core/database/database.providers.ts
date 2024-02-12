import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { User } from 'src/modules/users/user.entity';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config: any;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelize = new Sequelize(config);

      // sequelize
      //   .authenticate()
      //   .then(() => console.log('Connected to DB'))
      //   .catch((err) => console.log('Error' + err));

      sequelize.addModels([User]); // add more models

      await sequelize
        .sync({ force: false })
        .then(() => console.log('Re-sync done'))
        .catch((err) => console.log(err));

      return sequelize;
    },
  },
];
