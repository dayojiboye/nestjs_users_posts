import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidateInputPipe } from './core/pipes/validate.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Global prefix i.e global endpoint base url
  app.setGlobalPrefix('api/v1');
  // Handle all user input validation globally
  app.useGlobalPipes(new ValidateInputPipe());
  await app.listen(3000);
}
bootstrap();

// Command to generate module
// nest generate module /core/database
// nest generate module /modules/users

// Command to generate service
// nest generate service /modules/users

// Command to generate controller
// nest g co /modules/auth
