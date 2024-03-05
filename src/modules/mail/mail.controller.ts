import { Controller, Get } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

// Test mail
@Controller('mail')
export class MailController {
  constructor(private readonly mailerService: MailerService) {}

  @Get()
  public async sendTestEmail() {
    try {
      await this.mailerService.sendMail({
        to: 'miwasaj884@mcuma.com',
        subject: 'Test Email',
        text: 'This is a test email from NestJS Mailer.',
        template: 'new-comment',
      });
      return 'Test email sent successfully YEAH!';
    } catch (error) {
      console.error('Error sending test email:', error);
      return 'Test email failed to send. Check your configuration.';
    }
  }
}
