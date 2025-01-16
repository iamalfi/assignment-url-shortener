import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { Address } from 'nodemailer/lib/mailer';

export class AddressDto {
  @ApiProperty({
    type: String,
    description: 'The email address',
  })
  @IsString()
  @IsEmail()
  address: string;

  @ApiProperty({
    type: String,
    description: 'The name associated with the email address',
  })
  @IsString()
  name: string;
}

export class SendEmailDto {
  @ApiProperty({
    type: AddressDto,
    description: 'The sender address',
    required: false,
  })
  @IsOptional()
  from: Address;

  @ApiProperty({
    type: AddressDto,
    isArray: true,
    description: 'The receiver address',
  })
  @IsArray()
  recipients: Address[];

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  html: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  text: string;
}
