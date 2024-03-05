import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { EmailProcessor } from './jobs/email.processor';
import { MailController } from './mail.controller';

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
  ],
  providers: [MailService, EmailProcessor],
  controllers: [MailController],
})
export class MailModule {}
