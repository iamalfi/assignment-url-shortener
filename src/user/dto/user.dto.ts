import { IsBoolean } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the email is verified',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'URL of the user profile image',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Password for the user account',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Password for the user account',
  })
  @IsString()
  password: string;
}
