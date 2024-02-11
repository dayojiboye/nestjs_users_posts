import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import sequelize from './config/dbConfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 8080;

  sequelize
    .sync({ force: false })
    .then(() => console.log('Re-sync done'))
    .catch((err) => console.log(err));

  await app.listen(PORT);
}
bootstrap();
