import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class OtpPayloadDto {
  @ApiProperty({
    description: 'The email address associated with the OTP',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The OTP value',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    description: 'The expiration timestamp of the OTP',
    example: 1632882937000,
  })
  @IsNotEmpty()
  exp: number;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The token used for OTP verification',
    example: 'abcdef123456',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'The OTP to verify',
    example: '123456',
  })
  @IsString()
  otp: string;
}

export class GenerateOtpDto {
  @ApiProperty({
    description: 'The email address where the OTP will be sent',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The URL to redirect to after OTP is generated',
    example: 'https://example.com/verify-otp',
  })
  @IsString()
  url: string;
}
