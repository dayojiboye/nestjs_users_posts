import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NEW_COMMENT_NOTIFICATION } from 'src/core/constants';
import { MailerService } from '@nestjs-modules/mailer';
import { IMail } from '../interfaces/mail.interface';

@Processor('emailSending')
export class EmailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process(NEW_COMMENT_NOTIFICATION)
  public async sendCommentNotification(job: Job<IMail>) {
    const { data } = job;

    const {
      postAuthorEmail,
      postAuthorFirstName,
      postTitle,
      commentAuthorUsername,
    } = data;

    await this.mailerService.sendMail({
      subject: 'New comment on your post',
      template: 'new-comment',
      to: postAuthorEmail,
      context: {
        postAuthorFirstName,
        postTitle,
        commentAuthorUsername,
      },
    });
  }
}
