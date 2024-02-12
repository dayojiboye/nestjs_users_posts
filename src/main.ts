import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Global prefix i.e global endpoint base url
  app.setGlobalPrefix(process.env.GLOBAL_PREFIX);
  const PORT = process.env.PORT || 8080;
  await app.listen(PORT);
}
bootstrap();

// Command to generate module
// nest generate module /core/database
// nest generate module /modules/users

// Command to generate service
// nest generate service /modules/users

// Command to generate controller
// nest g co /modules/auth
