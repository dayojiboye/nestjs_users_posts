import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { commentsProviders } from './comments.provider';
import { MailService } from '../mail/mail.service';
import { BullModule } from '@nestjs/bull';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'emailSending',
    }),
    PostsModule,
  ],
  providers: [CommentsService, MailService, ...commentsProviders],
  controllers: [CommentsController],
})
export class CommentsModule {}
