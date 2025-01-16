import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { RefreshJwtGuard } from 'src/guards/refresh.guard';
import { VerifyOtpDto } from 'src/otp/dto/otp.dto';
import { UserGuard } from 'src/guards/user.guard';
import { GetUser } from 'src/decorator/user.decorator';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the profile of the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access',
  })
  @Get()
  async getUserProfile(@GetUser() user: IUserPayload) {
    return await this.userService.findById(user.id);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid input data',
  })
  @Post('register')
  async registerUser(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns tokens',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid credentials',
  })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.userService.login(dto);
  }

  @ApiOperation({ summary: 'Login a user with Google' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns tokens',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid input data',
  })
  @Post('google')
  async otherLogin(@Body() dto: CreateUserDto) {
    return await this.userService.googleLogin(dto);
  }

  @UseGuards(RefreshJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh the JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid or expired refresh token',
  })
  @Post('refresh')
  async refreshToken(@Request() req) {
    return await this.userService.refreshToken(req.user);
  }

  @ApiOperation({ summary: 'Verify the user email using OTP' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid OTP',
  })
  @Post('verify')
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return await this.userService.verifyEmail(dto);
  }
}
