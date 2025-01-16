import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from './dto/mailer.dto';

@ApiTags('mailer')
@Controller('mailer')
export class MailerController {
  constructor(private mailerService: MailerService) {}

  @Post('send-mail')
  async sendMail(@Body() dto: SendEmailDto) {
    return await this.mailerService.sendEmail(dto);
  }
}
