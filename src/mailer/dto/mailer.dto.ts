import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { Address } from 'nodemailer/lib/mailer';

export class AddressDto {
  @ApiProperty({
    type: String,
    description: 'The email address',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsEmail()
  address: string;

  @ApiProperty({
    type: String,
    description: 'The name associated with the email address',
    example: 'John Doe',
  })
  @IsString()
  name: string;
}

export class SendEmailDto {
  @ApiProperty({
    type: AddressDto,
    description: 'The sender address',
    required: false,
    example: {
      address: 'sender@example.com',
      name: 'Sender Name',
    },
  })
  @IsOptional()
  from: Address;

  @ApiProperty({
    type: AddressDto,
    isArray: true,
    description: 'The receiver addresses',
    example: [
      { address: 'recipient1@example.com', name: 'Recipient One' },
      { address: 'recipient2@example.com', name: 'Recipient Two' },
    ],
  })
  @IsArray()
  recipients: Address[];

  @ApiProperty({
    description: 'The email subject',
    example: 'Welcome to our platform!',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'The email content in HTML format',
    example: '<p>Hello, welcome to our platform!</p>',
  })
  @IsString()
  html: string;

  @ApiProperty({
    description: 'The plain text version of the email content',
    required: false,
    example: 'Hello, welcome to our platform!',
  })
  @IsString()
  @IsOptional()
  text: string;
}
