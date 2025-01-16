import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @ApiOperation({ summary: 'Generate an OTP token' })
  @ApiResponse({
    status: 201,
    description: 'OTP token generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid input data',
  })
  @Post('generate')
  async generateOTP(@Body() dto: GenerateOtpDto) {
    const token = await this.otpService.generateOTPToken(dto);
    return { token };
  }

  @ApiOperation({ summary: 'Verify an OTP token' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid OTP or OTP expired',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: OTP verification failed',
  })
  @Post('verify')
  async verifyOTP(@Body() dto: VerifyOtpDto) {
    const payload = await this.otpService.verifyOTPToken(dto);
    return payload;
  }
}
