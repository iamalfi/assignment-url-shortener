import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post('generate')
  async generateOTP(@Body() dto: GenerateOtpDto) {
    const token = await this.otpService.generateOTPToken(dto);
    return { token };
  }

  @Post('verify')
  async verifyOTP(@Body() dto: VerifyOtpDto) {
    const payload = await this.otpService.verifyOTPToken(dto);
    return payload;
  }
}
