import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import type { RedisClientOptions } from 'redis';
import { BullModule } from '@nestjs/bull';
import { MailModule } from './modules/mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MailModule,
    UsersModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    CloudinaryModule,
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
          },
          // ttl: 60 // Time-To-Live in milliseconds
          // max: 1000 // Number of items that can be in the cache at once
        }),
      }),
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_TRANSPORT_HOST,
        port: process.env.MAILER_TRANSPORT_PORT,
        auth: {
          user: process.env.MAILER_USERNAME,
          pass: process.env.MAILER_PASS,
        },
      },
      defaults: { from: '"Sandbox" <test@test.com>' },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
