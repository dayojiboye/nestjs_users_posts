import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { NEW_COMMENT_NOTIFICATION } from 'src/core/constants';
import { IMail } from './interfaces/mail.interface';

// PRODUCER
@Injectable()
export class MailService {
  constructor(
    @InjectQueue('emailSending') private readonly emailQueue: Queue,
  ) {}

  public async sendCommentNotification(data: IMail) {
    const job = await this.emailQueue.add(NEW_COMMENT_NOTIFICATION, data);

    return { jobId: job.id };
  }
}
