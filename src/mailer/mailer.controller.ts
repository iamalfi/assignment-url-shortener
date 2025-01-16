import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendEmailDto } from './dto/mailer.dto';

@ApiTags('mailer')
@Controller('mailer')
export class MailerController {
  constructor(private mailerService: MailerService) {}

  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({
    status: 201,
    description: 'Email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid email data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error: Email service failed',
  })
  @Post('send-mail')
  async sendMail(@Body() dto: SendEmailDto) {
    return await this.mailerService.sendEmail(dto);
  }
}
